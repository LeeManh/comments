import { Module } from '@nestjs/common';
import { SeriesController } from './series.controller';
import { SeriesService } from './series.service';
import { DatabaseModule } from 'src/database/database.module';
import { Series } from 'src/models/series.model';
import { PostsModule } from 'src/posts/posts.module';
import { SeriesTags } from 'src/models/series-tags.model';
import { TagsModule } from 'src/tags/tags.module';

@Module({
  imports: [
    DatabaseModule.forFeature([Series, SeriesTags]),
    PostsModule,
    TagsModule,
  ],
  controllers: [SeriesController],
  providers: [SeriesService],
  exports: [SeriesService],
})
export class SeriesModule {}
