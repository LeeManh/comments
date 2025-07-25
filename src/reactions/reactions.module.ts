import { forwardRef, Module } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';
import { DatabaseModule } from 'src/database/database.module';
import { Reaction } from 'src/models/reaction.model';
import { PostsModule } from 'src/posts/posts.module';
import { CommentsModule } from 'src/comments/comments.module';

@Module({
  imports: [
    DatabaseModule.forFeature([Reaction]),
    forwardRef(() => PostsModule),
    CommentsModule,
  ],
  providers: [ReactionsService],
  controllers: [ReactionsController],
  exports: [ReactionsService],
})
export class ReactionsModule {}
