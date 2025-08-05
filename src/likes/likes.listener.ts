import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/sequelize';
import { Like } from 'src/models/like.model';
import { LikeTargetType } from 'src/commons/constants/like.constant';
import { EVENT_NAME } from 'src/commons/constants/event.constant';

@Injectable()
export class LikesListener {
  constructor(
    @InjectModel(Like)
    private readonly likeRepository: typeof Like,
  ) {}

  @OnEvent(EVENT_NAME.POST.DELETED)
  async handlePostDeleted(postId: string) {
    await this.likeRepository.destroy({
      where: { targetId: postId, targetType: LikeTargetType.POST },
    });
  }

  @OnEvent(EVENT_NAME.COMMENT.DELETED)
  async handleCommentDeleted(commentId: string) {
    await this.likeRepository.destroy({
      where: { targetId: commentId, targetType: LikeTargetType.COMMENT },
    });
  }

  @OnEvent(EVENT_NAME.SERIES.DELETED)
  async handleSeriesDeleted(seriesId: string) {
    await this.likeRepository.destroy({
      where: { targetId: seriesId, targetType: LikeTargetType.SERIES },
    });
  }
}
