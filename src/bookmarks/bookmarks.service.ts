import { SeriesService } from 'src/series/series.service';
import { PostsService } from 'src/posts/posts.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Bookmark } from 'src/models/bookmark.model';
import { CreateBookmarkDto } from './dtos/create-bookmark.dto';
import { handleError } from 'src/commons/utils/error.util';
import { BookmarkTargetType } from 'src/commons/constants/bookmark.constant';
import { GetMyBookmarksParams } from './dtos/get-my-bookmark-params.dto';
import { QueryUtil } from 'src/commons/utils/query.util';
import { MetaData } from 'src/commons/types/common.type';
import { Post } from 'src/models/post.model';
import { Series } from 'src/models/series.model';
import { User } from 'src/models/user.model';
import { Tag } from 'src/models/tag.model';
import { WhereOptions } from 'sequelize';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectModel(Bookmark)
    private readonly bookmarkRepository: typeof Bookmark,
    private readonly postsService: PostsService,
    private readonly seriesService: SeriesService,
  ) {}

  async create(userId: string, createBookmarkDto: CreateBookmarkDto) {
    try {
      const { targetId, targetType } = createBookmarkDto;

      await this.validateTargetExists(targetId, targetType);

      const bookmark = await this.bookmarkRepository.findOne({
        where: { targetId, targetType, userId },
      });

      if (bookmark) {
        bookmark.destroy();
        return;
      }

      return this.bookmarkRepository.create({
        ...createBookmarkDto,
        userId,
      });
    } catch (error) {
      handleError(error);
    }
  }

  async getMyBookmarks(
    userId: string,
    getMyBookmarksParams: GetMyBookmarksParams,
  ) {
    const { targetType, page, limit } = getMyBookmarksParams;

    const where: WhereOptions = {
      userId,
      ...(targetType !== undefined
        ? { targetType }
        : {
            targetType: [BookmarkTargetType.POST, BookmarkTargetType.SERIES],
          }),
    };

    const postInclude = {
      model: Post,
      required: false,
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

    const seriesInclude = {
      model: Series,
      required: false,
      include: [
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
      ],
    };

    const { count, rows: data } = await this.bookmarkRepository.findAndCountAll(
      {
        where,
        order: [['createdAt', 'DESC']],
        offset: QueryUtil.getOffset(page, limit),
        limit,
        include: [postInclude, seriesInclude],
      },
    );

    const meta: MetaData = QueryUtil.calculateMeta(page, limit, count);

    return { meta, data };
  }

  private async validateTargetExists(
    targetId: string,
    targetType: BookmarkTargetType,
  ) {
    let target: unknown;

    switch (targetType) {
      case BookmarkTargetType.POST:
        target = await this.postsService.findOneById(targetId);
        break;
      case BookmarkTargetType.SERIES:
        target = await this.seriesService.findOneById(targetId);
        break;
      default:
        throw new BadRequestException('Invalid target type');
    }

    if (!target)
      throw new BadRequestException(`Target with id ${targetId} not found`);
  }
}
