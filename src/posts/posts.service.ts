import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Post } from 'src/models/post.model';
import { User } from 'src/models/user.model';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { handleError } from 'src/commons/utils/error.util';
import { QueryParamsDto } from 'src/commons/dtos/query-params.dto';
import { MetaData, SortType } from 'src/commons/types/common.type';
import { Op, OrderItem, WhereOptions } from 'sequelize';
import { QueryUtil } from 'src/commons/utils/query.util';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ReactionTarget, ReactionType } from 'src/commons/types/reaction.type';
import { ReactionsService } from 'src/reactions/reactions.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post)
    private readonly postsRepository: typeof Post,
    @Inject(forwardRef(() => ReactionsService))
    private readonly reactionsService: ReactionsService,
  ) {}

  async create(user: User, createPostDto: CreatePostDto) {
    try {
      // remove old featured post
      if (createPostDto.featured) await this.removeOldFeaturedPost(user.id);

      const post = await this.postsRepository.create({
        ...createPostDto,
        authorId: user.id,
        slug: await this.generateSlug(createPostDto.title),
      });
      return post;
    } catch (error) {
      handleError(error, 'Post');
    }
  }

  async findAll(queryParamsDto: QueryParamsDto) {
    const { page, limit, search, sort } = queryParamsDto;

    const where: WhereOptions = {};
    if (search) {
      where.title = {
        [Op.iLike]: `%${search}%`,
      };
    }

    const { count, rows: data } = await this.postsRepository.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'username'],
        },
      ],
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM comments
              WHERE comments."postId" = "Post"."id"
            )`),
            'commentsCount',
          ],
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM reactions
              WHERE reactions."targetId" = "Post"."id"
                AND reactions."targetType" = ${ReactionTarget.POST}
                AND reactions."type" = ${ReactionType.LIKE}
            )`),
            'likesCount',
          ],
        ],
      },
      order: this.getSortOrder(sort) as OrderItem[],
      offset: QueryUtil.getOffset(page, limit),
      limit: limit,
    });

    const meta: MetaData = QueryUtil.calculateMeta(page, limit, count);

    return { meta, data };
  }

  async findOne(id: string, user?: User) {
    console.log('user', user);
    const post = await this.postsRepository.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username'],
        },
      ],
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM comments
              WHERE comments."postId" = "Post"."id"
            )`),
            'commentsCount',
          ],
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM reactions
              WHERE reactions."targetId" = "Post"."id"
                AND reactions."targetType" = ${ReactionTarget.POST}
                AND reactions."type" = ${ReactionType.LIKE}
            )`),
            'likesCount',
          ],
        ],
      },
    });

    await this.setIsLiked(post, user);

    return post;
  }

  async findFeatured() {
    const post = await this.postsRepository.findOne({
      where: { featured: true },
    });
    return post;
  }

  async update(user: User, id: string, updatePostDto: UpdatePostDto) {
    try {
      const post = await this.findOne(id);
      if (!post) throw new NotFoundException('Not found post');

      const isAuthor = post.authorId === user.id;
      if (!isAuthor) throw new ForbiddenException('You are not the author');

      if (updatePostDto.featured && !post.featured)
        await this.removeOldFeaturedPost(user.id);

      await this.postsRepository.update(updatePostDto, { where: { id } });
    } catch (error) {
      handleError(error, 'Post');
    }
  }

  async delete(user: User, id: string) {
    const post = await this.findOne(id);
    if (!post) throw new NotFoundException('Not found post');

    const isAuthor = post.authorId === user.id;
    if (!isAuthor) throw new ForbiddenException('You are not the author');

    await this.postsRepository.destroy({ where: { id } });
  }

  private async generateSlug(title: string) {
    let slug = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    slug = slug.toLowerCase();
    slug = slug.replace(/[^a-z0-9]+/g, '-');
    slug = slug.replace(/^-+|-+$/g, '').replace(/-+/g, '-');

    return slug;
  }

  private async setIsLiked(post: Post, user?: User) {
    if (user) {
      const isLiked = await this.reactionsService.checkReaction(
        user.id,
        post.id,
        ReactionTarget.POST,
        ReactionType.LIKE,
      );
      post.setDataValue('isLiked', isLiked);
    } else {
      post.setDataValue('isLiked', false);
    }
  }

  private async removeOldFeaturedPost(userId: string) {
    await this.postsRepository.update(
      { featured: false },
      { where: { featured: true, authorId: userId } },
    );
  }

  private getSortOrder(sortType: SortType) {
    const orders = {
      [SortType.NEW]: [['createdAt', 'DESC']],
      [SortType.TOP]: [
        ['likesCount', 'DESC'],
        ['createdAt', 'DESC'],
      ],
      [SortType.COMMUNITY]: [
        ['commentsCount', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    };

    return orders[sortType];
  }
}
