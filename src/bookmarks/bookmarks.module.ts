import { Module } from '@nestjs/common';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { DatabaseModule } from 'src/database/database.module';
import { Bookmark } from 'src/models/bookmark.model';
import { PostsModule } from 'src/posts/posts.module';
import { SeriesModule } from 'src/series/series.module';

@Module({
  imports: [DatabaseModule.forFeature([Bookmark]), PostsModule, SeriesModule],
  controllers: [BookmarksController],
  providers: [BookmarksService],
})
export class BookmarksModule {}
