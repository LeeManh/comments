import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CommentTargetType } from 'src/commons/constants/comment.constant';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsUUID()
  targetId: string;

  @IsNotEmpty()
  @IsEnum(CommentTargetType)
  targetType: CommentTargetType;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
