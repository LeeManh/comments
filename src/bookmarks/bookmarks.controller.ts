import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dtos/create-bookmark.dto';
import { CurrentUser } from 'src/commons/decorators/current-user.decorator';
import { User } from 'src/models/user.model';
import { ResponseMessage } from 'src/commons/decorators/response-message.decorator';
import { GetMyBookmarksParams } from './dtos/get-my-bookmark-params.dto';

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  @ResponseMessage('Create bookmark success')
  async create(
    @Body() createBookmarkDto: CreateBookmarkDto,
    @CurrentUser() user: User,
  ) {
    return this.bookmarksService.create(user.id, createBookmarkDto);
  }

  @Get()
  async getMyBookmarks(
    @Query() getMyBookmarksParams: GetMyBookmarksParams,
    @CurrentUser() user: User,
  ) {
    return this.bookmarksService.getMyBookmarks(user.id, getMyBookmarksParams);
  }
}
