import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PostsService } from './posts.service';
import { ResponseMessage } from 'src/commons/decorators/response-message.decorator';
import { CreatePostDto } from './dtos/create-post.dto';
import { CurrentUser } from 'src/commons/decorators/current-user.decorator';
import { User } from 'src/models/user.model';
import { PublicApi } from 'src/commons/decorators/public-api.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ResponseMessage('Create post success')
  @Post('')
  async create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.create(user, createPostDto);
  }

  @PublicApi()
  @ResponseMessage('Get all posts success')
  @Get('')
  async findAll() {
    return await this.postsService.findAll();
  }

  @PublicApi()
  @ResponseMessage('Get post detail success')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.postsService.findOne(id);
  }
}
