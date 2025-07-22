import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { commentsProviders } from './comments.providers';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, ...commentsProviders],
})
export class CommentsModule {}
