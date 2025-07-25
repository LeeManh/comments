import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Reaction } from 'src/models/reaction.model';
import { ToggleReactionDto } from './dtos/toggle-reaction.dto';
import { ReactionTarget, ReactionType } from 'src/commons/types/reaction.type';
import { PostsService } from 'src/posts/posts.service';
import { CommentsService } from 'src/comments/comments.service';
import { handleError } from 'src/commons/utils/error.util';
import { Op } from 'sequelize';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectModel(Reaction) private readonly reactionRepository: typeof Reaction,
    @Inject(forwardRef(() => PostsService))
    private readonly postService: PostsService,
    private readonly commentService: CommentsService,
  ) {}

  async toggle(userId: string, toggleReactionDto: ToggleReactionDto) {
    try {
      const { targetId, targetType } = toggleReactionDto;

      await this.validateTarget(targetId, targetType);

      const findReaction = await this.findOne(userId, targetId, targetType);

      if (findReaction) {
        await findReaction.destroy();
      } else {
        await this.create(userId, toggleReactionDto);
      }
    } catch (error) {
      handleError(error, 'Reaction');
    }
  }

  async create(userId: string, toggleReactionDto: ToggleReactionDto) {
    return await this.reactionRepository.create({
      ...toggleReactionDto,
      userId,
    });
  }

  async findOne(userId: string, targetId: string, targetType: ReactionTarget) {
    return await this.reactionRepository.findOne({
      where: { userId, targetId, targetType },
    });
  }

  async getUserReactionsForComments(
    userId: string,
    commentIds: string[],
    type: ReactionType = ReactionType.LIKE,
  ) {
    return await this.reactionRepository.findAll({
      where: {
        userId,
        targetId: { [Op.in]: commentIds },
        targetType: ReactionTarget.COMMENT,
        type,
      },
    });
  }

  async checkReaction(
    userId: string,
    targetId: string,
    targetType: ReactionTarget,
    type: ReactionType,
  ) {
    const reaction = await this.findOne(userId, targetId, targetType);
    if (!reaction) return false;
    return reaction.type === type;
  }

  private async validateTarget(targetId: string, targetType: ReactionTarget) {
    if (targetType === ReactionTarget.POST) {
      const post = await this.postService.findOne(targetId);
      if (!post) throw new NotFoundException('Post not found');
    } else if (targetType === ReactionTarget.COMMENT) {
      const comment = await this.commentService.findById(targetId);
      if (!comment) throw new NotFoundException('Comment not found');
    } else {
      throw new BadRequestException('Invalid target type');
    }
  }
}
