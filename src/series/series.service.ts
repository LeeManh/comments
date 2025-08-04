import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Series } from 'src/models/series.model';
import { CreateSeriesDto } from './dtos/create-series.dto';
import { handleError } from 'src/commons/utils/error.util';
import { generateSlug } from 'src/commons/utils/format.util';
import { Post } from 'src/models/post.model';
import { User } from 'src/models/user.model';
import { PostsService } from 'src/posts/posts.service';
import { Includeable, WhereOptions } from 'sequelize';
import { Tag } from 'src/models/tag.model';
import { QueryParamsDto } from 'src/commons/dtos/query-params.dto';
import { Op } from 'sequelize';
import { QueryUtil } from 'src/commons/utils/query.util';
import { MetaData } from 'src/commons/types/common.type';
import { UpdateSeriesDto } from './dtos/update-series.dto';

@Injectable()
export class SeriesService {
  constructor(
    @InjectModel(Series) private readonly seriesRepository: typeof Series,
    private readonly postService: PostsService,
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
  ];

  // Create series
  async create(userId: string, createSeriesDto: CreateSeriesDto) {
    try {
      const { postIds, ...seriesData } = createSeriesDto;
      const series = await this.seriesRepository.create({
        ...seriesData,
        slug: generateSlug(seriesData.title),
        authorId: userId,
      });

      if (postIds.length > 0) {
        await this.postService.addPostsToSeries(userId, postIds, series.id);
      }

      return series.reload({ include: this.SERIES_INCLUDE });
    } catch (error) {
      handleError(error);
    }
  }

  // get details 1 series
  async findOne(id: string) {
    const series = await this.seriesRepository.findByPk(id, {
      include: this.SERIES_INCLUDE,
    });
    if (!series) throw new NotFoundException('Series not found');
    return series;
  }

  // get list series
  async findAll(queryParamsDto: QueryParamsDto) {
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
}
