import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { DatabaseModule } from 'src/database/database.module';
import { Post } from 'src/models/post.model';
import { TagsModule } from 'src/tags/tags.module';

@Module({
  imports: [DatabaseModule.forFeature([Post]), TagsModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
