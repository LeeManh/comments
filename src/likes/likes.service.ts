import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Like } from 'src/models/like.model';
import { CreateLikeDto } from './dtos/create-like.dto';
import { handleError } from 'src/commons/utils/error.util';
import { LikeTargetType } from 'src/commons/constants/like.constant';
import { PostsService } from 'src/posts/posts.service';
import { SeriesService } from 'src/series/series.service';
import { CommentsService } from 'src/comments/comments.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectModel(Like) private readonly likeRepository: typeof Like,
    private readonly postService: PostsService,
    private readonly seriesService: SeriesService,
    private readonly commentService: CommentsService,
  ) {}

  async create(userId: string, createLikeDto: CreateLikeDto) {
    try {
      const { targetId, targetType, isDislike = false } = createLikeDto;

      await this.validateTargetExists(targetId, targetType);

      const existingLike = await this.likeRepository.findOne({
        where: { targetId, targetType, userId },
      });

      if (existingLike) {
        await existingLike.destroy();
        return;
      }

      const like = await this.likeRepository.create({
        targetId,
        targetType,
        isDislike,
        userId,
      });
      return like;
    } catch (error) {
      handleError(error);
    }
  }

  private async validateTargetExists(
    targetId: string,
    targetType: LikeTargetType,
  ) {
    let target: unknown;

    switch (targetType) {
      case LikeTargetType.POST:
        target = await this.postService.findOneById(targetId);
        break;
      case LikeTargetType.COMMENT:
        target = await this.commentService.findOneById(targetId);
        break;
      case LikeTargetType.SERIES:
        target = await this.seriesService.findOneById(targetId);
        break;
      default:
        throw new BadRequestException('Invalid target type');
    }

    if (!target)
      throw new BadRequestException(`Target with id ${targetId} not found`);
  }
}
