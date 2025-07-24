import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ReactionTarget, ReactionType } from 'src/commons/types/reaction.type';

export class ToggleReactionDto {
  @IsUUID()
  targetId: string;

  @IsEnum(ReactionTarget)
  targetType: ReactionTarget;

  @IsOptional()
  @IsEnum(ReactionType)
  type?: ReactionType = ReactionType.LIKE;
}
