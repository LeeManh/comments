import { forwardRef, Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { DatabaseModule } from 'src/database/database.module';
import { Comment } from 'src/models/comments.model';
import { ReactionsModule } from 'src/reactions/reactions.module';

@Module({
  imports: [
    DatabaseModule.forFeature([Comment]),
    forwardRef(() => ReactionsModule),
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
