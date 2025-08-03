import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { ResponseMessage } from 'src/commons/decorators/response-message.decorator';
import { CreatePostDto } from './dtos/create-post.dto';
import { CurrentUser } from 'src/commons/decorators/current-user.decorator';
import { User } from 'src/models/user.model';
import { PublicApi } from 'src/commons/decorators/public-api.decorator';
import { UpdatePostDto } from './dtos/update-post.dto';
import { QueryParamsDto } from 'src/commons/dtos/query-params.dto';
import { Roles } from 'src/commons/decorators/roles.decorator';
import { UserRole } from 'src/commons/constants/user.constant';
import { OptionalAuthApi } from 'src/commons/decorators/optional-auth-api.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Roles(UserRole.ADMIN)
  @ResponseMessage('Create post success')
  @Post('')
  async create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.create(user, createPostDto);
  }

  @PublicApi()
  @ResponseMessage('Get posts success')
  @Get('')
  async findAll(@Query() queryParamsDto: QueryParamsDto) {
    return await this.postsService.findAll(queryParamsDto);
  }

  @PublicApi()
  @ResponseMessage('Get featured post success')
  @Get('featured')
  async findFeatured() {
    return await this.postsService.findFeatured();
  }

  @OptionalAuthApi()
  @ResponseMessage('Get post detail success')
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: User,
  ) {
    return await this.postsService.findOne(id, user);
  }

  @Roles(UserRole.ADMIN)
  @ResponseMessage('Update post success')
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return await this.postsService.update(user, id, updatePostDto);
  }

  @Roles(UserRole.ADMIN)
  @ResponseMessage('Delete post success')
  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.delete(user, id);
  }
}
