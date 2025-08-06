import {
  BadRequestException,
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
import {
  SeriesStatus,
  SeriesVisibility,
} from 'src/commons/constants/series.constant';
import { UserRole } from 'src/commons/constants/user.constant';
import {
  PostStatus,
  PostVisibility,
} from 'src/commons/constants/post.constant';

@Injectable()
export class SeriesService {
  constructor(
    @InjectModel(Series) private readonly seriesRepository: typeof Series,
    private readonly postService: PostsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly tagsService: TagsService,
  ) {}

  private SERIES_INCLUDE: Includeable[] = [
    // {
    //   model: Post,
    //   include: [
    //     {
    //       model: User,
    //       attributes: ['id', 'username', 'avatar', 'displayName'],
    //     },
    //     {
    //       model: Tag,
    //       through: { attributes: [] },
    //     },
    //   ],
    // },
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

      // Xử lý logic status và publishedAt
      this.setPublishedAtByStatus(seriesData);

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

  async findOne(id: string, user?: User, isAdminApi = false) {
    const where: WhereOptions = { id };

    // Lọc theo quyền đọc
    this.applySeriesVisibilityFilter(where, isAdminApi);

    const series = await this.seriesRepository.findOne({
      where,
      include: [
        ...this.SERIES_INCLUDE,
        this.getPostIncludeInSeries(isAdminApi),
      ],
      attributes: this.getSeriesAttributes(user?.id),
    });
    if (!series) throw new NotFoundException('Series not found');
    return series;
  }

  async findOneById(id: string) {
    return this.seriesRepository.findByPk(id);
  }

  async findAll(
    queryParamsDto: QueryParamsDto,
    user?: User,
    isAdminApi = false,
  ) {
    const { page, limit, search } = queryParamsDto;

    const where: WhereOptions = {};
    if (search) {
      where.title = {
        [Op.iLike]: `%${search}%`,
      };
    }

    // Lọc theo quyền đọc
    this.applySeriesVisibilityFilter(where, isAdminApi);

    const { count, rows: data } = await this.seriesRepository.findAndCountAll({
      where,
      include: [
        ...this.SERIES_INCLUDE,
        this.getPostIncludeInSeries(isAdminApi),
      ],
      order: [['createdAt', 'DESC']],
      offset: QueryUtil.getOffset(page, limit),
      limit: limit,
      attributes: this.getSeriesAttributes(user?.id),
      distinct: true,
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

      // Xử lý logic status và publishedAt
      this.setPublishedAtByStatus(seriesData);

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

  private setPublishedAtByStatus(seriesData: any) {
    const now = new Date();

    if (seriesData.status === SeriesStatus.SCHEDULED) {
      if (!seriesData.scheduledAt) {
        throw new BadRequestException(
          'scheduledAt is required for scheduled series',
        );
      }

      const scheduled = new Date(seriesData.scheduledAt);
      if (scheduled <= now) {
        throw new BadRequestException('scheduledAt must be in the future');
      }

      seriesData.publishedAt = scheduled;
    } else if (seriesData.status === SeriesStatus.PUBLISHED) {
      seriesData.publishedAt = now;
    } else {
      // DRAFT hoặc các status khác
      seriesData.publishedAt = null;
    }
  }

  private applySeriesVisibilityFilter(
    where: WhereOptions,
    isAdminApi?: boolean,
  ) {
    if (isAdminApi) return;

    // Người dùng chưa đăng nhập chỉ xem được series PUBLIC và PUBLISHED
    where[Op.and] = [
      { status: SeriesStatus.PUBLISHED },
      { visibility: SeriesVisibility.PUBLIC },
    ];
  }

  private getPostIncludeInSeries(isAdminApi?: boolean): Includeable {
    return {
      model: Post,
      required: false,
      where: isAdminApi
        ? undefined
        : {
            status: PostStatus.PUBLISHED,
            visibility: PostVisibility.PUBLIC,
          },
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
    };
  }
}
