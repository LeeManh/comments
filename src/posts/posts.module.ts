import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { postsProviders } from './posts.providers';

@Module({
  controllers: [PostsController],
  providers: [PostsService, ...postsProviders],
})
export class PostsModule {}
