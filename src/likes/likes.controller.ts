import { Body, Controller, Post } from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dtos/create-like.dto';
import { CurrentUser } from 'src/commons/decorators/current-user.decorator';
import { User } from 'src/models/user.model';
import { ResponseMessage } from 'src/commons/decorators/response-message.decorator';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @ResponseMessage('Create likes success')
  async create(
    @Body() createLikeDto: CreateLikeDto,
    @CurrentUser() user: User,
  ) {
    return this.likesService.create(user.id, createLikeDto);
  }
}
