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
import { Op, WhereOptions } from 'sequelize';
import { QueryUtil } from 'src/commons/utils/query.util';
import { InjectModel } from '@nestjs/sequelize';

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
      });
      return post;
    } catch (error) {
      handleError(error, 'Post');
    }
  }

  async findAll(queryParamsDto: QueryParamsDto) {
    const { page, limit, search } = queryParamsDto;

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
      order: [['createdAt', 'DESC']],
      offset: QueryUtil.getOffset(page, limit),
      limit: limit,
    });

    const meta: MetaData = QueryUtil.calculateMeta(page, limit, count);

    return { meta, data };
  }

  async findOne(id: string) {
    const post = await this.postsRepository.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username'],
        },
      ],
    });
    return post;
  }

  async update(user: User, id: string, updatePostDto: UpdatePostDto) {
    try {
      const post = await this.findOne(id);
      if (!post) throw new NotFoundException('Not found post');

      const isAuthor = post.authorId === user.id;
      if (!isAuthor) throw new ForbiddenException('You are not the author');

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
}
