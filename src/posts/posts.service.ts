import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Post } from 'src/models/post.model';
import { User } from 'src/models/user.model';
import { CreatePostDto, TagDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { handleError } from 'src/commons/utils/error.util';
import { QueryParamsDto } from 'src/commons/dtos/query-params.dto';
import { MetaData } from 'src/commons/types/common.type';
import { FindAttributeOptions, Op, WhereOptions } from 'sequelize';
import { QueryUtil } from 'src/commons/utils/query.util';
import { InjectModel } from '@nestjs/sequelize';
import { generateSlug } from 'src/commons/utils/format.util';
import { TagsService } from 'src/tags/tags.service';
import { Tag } from 'src/models/tag.model';
import { LikeTargetType } from 'src/commons/constants/like.constant';
import { Literal } from 'sequelize/types/utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENT_NAME } from 'src/commons/constants/event.constant';
import {
  PostStatus,
  PostVisibility,
} from 'src/commons/constants/post.constant';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post)
    private readonly postsRepository: typeof Post,
    private readonly tagsService: TagsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private POST_INCLUDE = [
    {
      model: User,
      attributes: ['id', 'username', 'avatar', 'displayName'],
    },
    {
      model: Tag,
      through: { attributes: [] },
    },
  ];

  async create(user: User, createPostDto: CreatePostDto) {
    try {
      const { tags, ...postData } = createPostDto;

      this.setPublishedAtByStatus(postData);

      const post = await this.postsRepository.create({
        ...postData,
        authorId: user.id,
        slug: generateSlug(createPostDto.title),
      });

      if (tags && tags.length > 0) {
        const tagInstances = await this.prepareTags(tags);
        await post.$set('tags', tagInstances);
      }

      return await post.reload({
        include: this.POST_INCLUDE,
      });
    } catch (error) {
      handleError(error, 'Post');
    }
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
    this.applyPostVisibilityFilter(where, isAdminApi);

    const { count, rows: data } = await this.postsRepository.findAndCountAll({
      where,
      include: this.POST_INCLUDE,
      order: [['createdAt', 'DESC']],
      offset: QueryUtil.getOffset(page, limit),
      limit: limit,
      attributes: this.getPostAttributes(user?.id),
      distinct: true,
    });

    const meta: MetaData = QueryUtil.calculateMeta(page, limit, count);

    return { meta, data };
  }

  async findOne(id: string, user?: User, isAdminApi = false) {
    const where: WhereOptions = { id };

    // Lọc theo quyền đọc
    this.applyPostVisibilityFilter(where, isAdminApi);

    const post = await this.postsRepository.findOne({
      where,
      include: this.POST_INCLUDE,
      attributes: this.getPostAttributes(user?.id),
    });

    if (!post) throw new NotFoundException('Not found post');

    return post;
  }

  async findOneById(id: string) {
    return this.postsRepository.findByPk(id);
  }

  async update(user: User, id: string, updatePostDto: UpdatePostDto) {
    try {
      const post = await this.postsRepository.findByPk(id);
      if (!post) throw new NotFoundException('Not found post');
      if (post.authorId !== user.id) throw new ForbiddenException('Forbidden');

      const { tags, ...postData } = updatePostDto;

      // Xử lý logic status và publishedAt
      this.setPublishedAtByStatus(postData);

      await post.update(postData);

      if (tags !== undefined) {
        if (tags && tags.length > 0) {
          const tagInstances = await this.prepareTags(tags);
          await post.$set('tags', tagInstances);
        } else {
          await post.$set('tags', []);
        }
      }

      return post;
    } catch (error) {
      handleError(error, 'Post');
    }
  }

  async delete(user: User, id: string) {
    try {
      const post = await this.postsRepository.findByPk(id);
      if (!post) throw new NotFoundException('Not found post');
      if (post.authorId !== user.id) throw new ForbiddenException('Forbidden');

      await post.destroy();

      this.eventEmitter.emit(EVENT_NAME.POST.DELETED, id);
    } catch (error) {
      handleError(error, 'Post');
    }
  }

  async addPostsToSeries(userId: string, postIds: string[], seriesId: string) {
    const posts = await this.postsRepository.findAll({
      where: { id: postIds, authorId: userId },
    });

    if (posts.length !== postIds.length) {
      const foundIds = posts.map((post) => post.id);
      const notFoundIds = postIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Posts not found: ${notFoundIds.join(', ')}`,
      );
    }

    return await this.postsRepository.update(
      { seriesId },
      { where: { id: postIds, authorId: userId } },
    );
  }

  async removePostsFormSeries(userId: string, seriesId: string) {
    await this.postsRepository.update(
      { seriesId: null },
      { where: { id: seriesId, authorId: userId } },
    );
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

  private getLikeCountAttributes(): [Literal, string][] {
    return [
      [
        this.postsRepository.sequelize.literal(`(
          SELECT CAST(COUNT(*) AS INTEGER) 
          FROM likes
          WHERE likes."targetId" = "Post".id
          AND likes."targetType" = ${LikeTargetType.POST}
          AND likes."isDislike" = false
        )`),
        'likes',
      ],
      [
        this.postsRepository.sequelize.literal(`(
          SELECT CAST(COUNT(*) AS INTEGER)
          FROM likes
          WHERE likes."targetId" = "Post".id
          AND likes."targetType" = ${LikeTargetType.POST}
          AND likes."isDislike" = true
        )`),
        'dislikes',
      ],
    ];
  }

  private getUserLikeStatusAttribute(userId: string): [Literal, string] {
    return [
      this.postsRepository.sequelize.literal(`(
        SELECT CASE 
          WHEN "isDislike" = true THEN 'dislike'
          WHEN "isDislike" = false THEN 'like'
          ELSE NULL
        END
        FROM likes
        WHERE likes."targetId" = "Post".id 
        AND likes."targetType" = ${LikeTargetType.POST}
        AND likes."userId" = '${userId}'
        LIMIT 1
      )`),
      'reaction',
    ];
  }

  private getPostAttributes(userId?: string): FindAttributeOptions {
    const attributes = {
      include: this.getLikeCountAttributes(),
    };

    if (userId) {
      attributes.include.push(this.getUserLikeStatusAttribute(userId));
    }

    return attributes;
  }

  private setPublishedAtByStatus(postData: any) {
    const now = new Date();

    if (postData.status === PostStatus.SCHEDULED) {
      if (!postData.scheduledAt) {
        throw new BadRequestException(
          'scheduledAt is required for scheduled posts',
        );
      }

      const scheduled = new Date(postData.scheduledAt);
      if (scheduled <= now) {
        throw new BadRequestException('scheduledAt must be in the future');
      }

      postData.publishedAt = scheduled;
    } else if (postData.status === PostStatus.PUBLISHED) {
      postData.publishedAt = now;
    } else {
      // DRAFT hoặc các status khác
      postData.publishedAt = null;
    }
  }

  private applyPostVisibilityFilter(where: WhereOptions, isAdminApi?: boolean) {
    if (isAdminApi) return;

    // Người dùng chưa đăng nhập chỉ xem được bài viết PUBLIC và PUBLISHED
    where[Op.and] = [
      { status: PostStatus.PUBLISHED },
      { visibility: PostVisibility.PUBLIC },
    ];
  }
}
