import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { LikeTargetType } from 'src/commons/constants/like.constant';

export class CreateLikeDto {
  @IsNotEmpty()
  @IsUUID()
  targetId: string;

  @IsNotEmpty()
  @IsEnum(LikeTargetType)
  targetType: LikeTargetType;

  @IsOptional()
  @IsBoolean()
  isDislike?: boolean = false;
}
