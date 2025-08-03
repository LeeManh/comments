import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Post } from 'src/models/post.model';
import { User } from 'src/models/user.model';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { handleError } from 'src/commons/utils/error.util';
import { QueryParamsDto } from 'src/commons/dtos/query-params.dto';
import { MetaData } from 'src/commons/types/common.type';
import { SortType } from 'src/commons/constants/filter.constant';
import { Op, OrderItem, WhereOptions } from 'sequelize';
import { QueryUtil } from 'src/commons/utils/query.util';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { generateSlug } from 'src/commons/utils/format.util';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post)
    private readonly postsRepository: typeof Post,
  ) {}

  async create(user: User, createPostDto: CreatePostDto) {
    try {
      const post = await this.postsRepository.create({
        ...createPostDto,
        authorId: user.id,
        slug: generateSlug(createPostDto.title),
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
          attributes: ['id', 'username', 'avatar'],
        },
      ],
      attributes: {
        include: [
          [
            Sequelize.cast(
              Sequelize.literal(`(
              SELECT COUNT(*)
              FROM comments
              WHERE comments."postId" = "Post"."id"
            )`),
              'INTEGER',
            ),
            'commentsCount',
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
    const post = await this.postsRepository.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'avatar'],
        },
      ],
      attributes: {
        include: [
          [
            Sequelize.cast(
              Sequelize.literal(`(
              SELECT COUNT(*)
              FROM comments
              WHERE comments."postId" = "Post"."id"
            )`),
              'INTEGER',
            ),
            'commentsCount',
          ],
        ],
      },
    });

    if (!post) throw new NotFoundException('Not found post');

    return post;
  }

  async update(user: User, id: string, updatePostDto: UpdatePostDto) {
    try {
      const post = await this.postsRepository.findByPk(id);
      if (!post) throw new NotFoundException('Not found post');
      if (post.authorId !== user.id) throw new ForbiddenException('Forbidden');

      await post.update(updatePostDto);
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
      return { message: 'Delete post success' };
    } catch (error) {
      handleError(error, 'Post');
    }
  }

  private getSortOrder(sortType: SortType) {
    switch (sortType) {
      case SortType.NEW:
        return [['createdAt', 'DESC']];
      case SortType.TOP:
        return [
          ['commentsCount', 'DESC'],
          ['createdAt', 'DESC'],
        ];
      case SortType.COMMUNITY:
        return [
          ['commentsCount', 'DESC'],
          ['createdAt', 'DESC'],
        ];
      default:
        return [['createdAt', 'DESC']];
    }
  }
}
