import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Series } from 'src/models/series.model';
import { CreateSeriesDto, TagDto } from './dtos/create-series.dto';
import { handleError } from 'src/commons/utils/error.util';
import { generateSlug } from 'src/commons/utils/format.util';
import { Post } from 'src/models/post.model';
import { User } from 'src/models/user.model';
import { PostsService } from 'src/posts/posts.service';
import { FindAttributeOptions, Includeable, WhereOptions } from 'sequelize';
import { Tag } from 'src/models/tag.model';
import { QueryParamsDto } from 'src/commons/dtos/query-params.dto';
import { Op } from 'sequelize';
import { QueryUtil } from 'src/commons/utils/query.util';
import { MetaData } from 'src/commons/types/common.type';
import { UpdateSeriesDto } from './dtos/update-series.dto';
import { Literal } from 'sequelize/types/utils';
import { LikeTargetType } from 'src/commons/constants/like.constant';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENT_NAME } from 'src/commons/constants/event.constant';
import { TagsService } from 'src/tags/tags.service';

@Injectable()
export class SeriesService {
  constructor(
    @InjectModel(Series) private readonly seriesRepository: typeof Series,
    private readonly postService: PostsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly tagsService: TagsService,
  ) {}

  private SERIES_INCLUDE: Includeable[] = [
    {
      model: Post,
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'avatar', 'displayName'],
        },
        {
          model: Tag,
          through: { attributes: [] },
        },
      ],
    },
    {
      model: User,
      attributes: ['id', 'username', 'avatar', 'displayName'],
    },
    {
      model: Tag,
      through: { attributes: [] },
    },
  ];

  async create(userId: string, createSeriesDto: CreateSeriesDto) {
    try {
      const { postIds, tags, ...seriesData } = createSeriesDto;
      const series = await this.seriesRepository.create({
        ...seriesData,
        slug: generateSlug(seriesData.title),
        authorId: userId,
      });

      if (postIds.length > 0) {
        await this.postService.addPostsToSeries(userId, postIds, series.id);
      }

      if (tags && tags.length > 0) {
        const tagInstances = await this.prepareTags(tags);
        await series.$set('tags', tagInstances);
      }

      return series.reload({ include: this.SERIES_INCLUDE });
    } catch (error) {
      handleError(error);
    }
  }

  async findOne(id: string, userId?: string) {
    const series = await this.seriesRepository.findByPk(id, {
      include: this.SERIES_INCLUDE,
      attributes: this.getSeriesAttributes(userId),
    });
    if (!series) throw new NotFoundException('Series not found');
    return series;
  }

  async findOneById(id: string) {
    return this.seriesRepository.findByPk(id);
  }

  async findAll(queryParamsDto: QueryParamsDto, userId?: string) {
    const { page, limit, search } = queryParamsDto;

    const where: WhereOptions = {};
    if (search) {
      where.title = {
        [Op.iLike]: `%${search}%`,
      };
    }

    const { count, rows: data } = await this.seriesRepository.findAndCountAll({
      where,
      include: this.SERIES_INCLUDE,
      order: [['createdAt', 'DESC']],
      offset: QueryUtil.getOffset(page, limit),
      limit: limit,
      attributes: this.getSeriesAttributes(userId),
    });

    const meta: MetaData = QueryUtil.calculateMeta(page, limit, count);

    return { meta, data };
  }

  // update series
  async update(
    userId: string,
    seriesId: string,
    updateSeriesDto: UpdateSeriesDto,
  ) {
    try {
      const series = await this.findSeriesWithPermission(userId, seriesId);
      const { postIds, ...seriesData } = updateSeriesDto;
      await this.updateSeriesData(series, seriesData);
      await this.updateSeriesPosts(userId, series, postIds);

      return series.reload({ include: this.SERIES_INCLUDE });
    } catch (error) {
      handleError(error);
    }
  }

  // delete series
  async delete(userId: string, seriesId: string) {
    const series = await this.findSeriesWithPermission(userId, seriesId);
    await series.destroy();

    this.eventEmitter.emit(EVENT_NAME.SERIES.DELETED, seriesId);
  }

  private async findSeriesWithPermission(userId: string, seriesId: string) {
    const series = await this.seriesRepository.findByPk(seriesId);
    if (!series) throw new NotFoundException('Series not found');
    if (series.authorId !== userId)
      throw new ForbiddenException('You are not the author');
    return series;
  }

  private async updateSeriesData(
    series: Series,
    seriesData: Omit<UpdateSeriesDto, 'postIds'>,
  ) {
    if (Object.keys(seriesData).length === 0) return;

    if (seriesData.title) {
      (seriesData as any).slug = generateSlug(seriesData.title);
    }

    await series.update(seriesData);
  }

  private async updateSeriesPosts(
    userId: string,
    series: Series,
    postIds?: string[],
  ) {
    if (postIds === undefined) return;

    await this.postService.removePostsFormSeries(userId, series.id);

    if (postIds.length > 0)
      await this.postService.addPostsToSeries(userId, postIds, series.id);
  }

  private getLikeCountAttributes(): [Literal, string][] {
    return [
      [
        this.seriesRepository.sequelize.literal(`(
          SELECT CAST(COUNT(*) AS INTEGER) 
          FROM likes
          WHERE likes."targetId" = "Series".id
          AND likes."targetType" = ${LikeTargetType.SERIES}
          AND likes."isDislike" = false
        )`),
        'likes',
      ],
      [
        this.seriesRepository.sequelize.literal(`(
          SELECT CAST(COUNT(*) AS INTEGER)
          FROM likes
          WHERE likes."targetId" = "Series".id
          AND likes."targetType" = ${LikeTargetType.SERIES}
          AND likes."isDislike" = true
        )`),
        'dislikes',
      ],
    ];
  }

  private getUserLikeStatusAttribute(userId: string): [Literal, string] {
    return [
      this.seriesRepository.sequelize.literal(`(
        SELECT CASE 
          WHEN "isDislike" = true THEN 'dislike'
          WHEN "isDislike" = false THEN 'like'
          ELSE NULL
        END
        FROM likes
        WHERE likes."targetId" = "Series".id 
        AND likes."targetType" = ${LikeTargetType.SERIES}
        AND likes."userId" = '${userId}'
        LIMIT 1
      )`),
      'reaction',
    ];
  }

  private getSeriesAttributes(userId?: string): FindAttributeOptions {
    const attributes = {
      include: this.getLikeCountAttributes(),
    };

    if (userId) {
      attributes.include.push(this.getUserLikeStatusAttribute(userId));
    }

    return attributes;
  }

  private async prepareTags(tags: TagDto[]) {
    const tagInstances: Tag[] = [];

    for (const tagData of tags) {
      let tag: Tag;
      if (tagData.id) {
        tag = await this.tagsService.fineOne(tagData.id);
      } else {
        [tag] = await this.tagsService.findOneOrCreateByName(tagData.name);
      }

      tagInstances.push(tag);
    }

    return tagInstances;
  }
}
