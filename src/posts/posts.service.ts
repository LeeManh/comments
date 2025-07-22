import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { POST_REPOSITORY_TOKEN } from './posts.providers';
import { Post } from 'src/models/post.model';
import { User } from 'src/models/user.model';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @Inject(POST_REPOSITORY_TOKEN)
    private readonly postsRepository: typeof Post,
  ) {}

  async create(user: User, createPostDto: CreatePostDto) {
    const post = await this.postsRepository.create({
      ...createPostDto,
      authorId: user.id,
    });
    return post;
  }

  async findAll() {
    const posts = await this.postsRepository.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'username'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    return posts;
  }

  async findOne(id: string) {
    const post = await this.postsRepository.findOne({
      where: { id },
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
    const post = await this.findOne(id);
    if (!post) throw new NotFoundException('Not found post');

    const isAuthor = post.authorId === user.id;
    if (!isAuthor) throw new ForbiddenException('You are not the author');

    await this.postsRepository.update({ ...updatePostDto }, { where: { id } });
  }

  async delete(user: User, id: string) {
    const post = await this.findOne(id);
    if (!post) throw new NotFoundException('Not found post');

    const isAuthor = post.authorId === user.id;
    if (!isAuthor) throw new ForbiddenException('You are not the author');

    await this.postsRepository.destroy({ where: { id } });
  }
}
