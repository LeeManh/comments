import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { ResponseMessage } from 'src/commons/decorators/response-message.decorator';
import { CreatePostDto } from './dtos/create-post.dto';
import { CurrentUser } from 'src/commons/decorators/current-user.decorator';
import { User } from 'src/models/user.model';
import { PublicApi } from 'src/commons/decorators/public-api.decorator';
import { UpdatePostDto } from './dtos/update-post.dto';

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

  @ResponseMessage('Update post success')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return await this.postsService.update(user, id, updatePostDto);
  }

  @ResponseMessage('Delete post success')
  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.postsService.delete(user, id);
  }
}
