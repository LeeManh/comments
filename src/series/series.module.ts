import { Module } from '@nestjs/common';
import { SeriesController } from './series.controller';
import { SeriesService } from './series.service';
import { DatabaseModule } from 'src/database/database.module';
import { Series } from 'src/models/series.model';
import { PostsModule } from 'src/posts/posts.module';

@Module({
  imports: [DatabaseModule.forFeature([Series]), PostsModule],
  controllers: [SeriesController],
  providers: [SeriesService],
})
export class SeriesModule {}
