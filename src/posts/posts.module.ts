import { forwardRef, Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { DatabaseModule } from 'src/database/database.module';
import { Post } from 'src/models/post.model';
import { ReactionsModule } from 'src/reactions/reactions.module';

@Module({
  imports: [
    DatabaseModule.forFeature([Post]),
    forwardRef(() => ReactionsModule),
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
