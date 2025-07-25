import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CurrentUser } from 'src/commons/decorators/current-user.decorator';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { User } from 'src/models/user.model';
import { ResponseMessage } from 'src/commons/decorators/response-message.decorator';
import { OptionalAuthApi } from 'src/commons/decorators/optional-auth-api.decorator';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ResponseMessage('Create comment success')
  @Post()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    return await this.commentsService.create(user, createCommentDto);
  }

  @OptionalAuthApi()
  @ResponseMessage('Get comments success')
  @Get('posts/:postId')
  async findAll(
    @Param('postId', ParseUUIDPipe) postId: string,
    @CurrentUser() user: User,
  ) {
    return await this.commentsService.findAll(postId, user);
  }
}
