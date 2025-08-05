import { Module } from '@nestjs/common';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { DatabaseModule } from 'src/database/database.module';
import { Like } from 'src/models/like.model';
import { PostsModule } from 'src/posts/posts.module';
import { SeriesModule } from 'src/series/series.module';
import { CommentsModule } from 'src/comments/comments.module';

@Module({
  imports: [
    DatabaseModule.forFeature([Like]),
    PostsModule,
    SeriesModule,
    CommentsModule,
  ],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
