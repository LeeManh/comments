import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import {
  PostStatus,
  PostVisibility,
} from 'src/commons/constants/post.constant';

export class TagDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsUrl()
  thumbnail?: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagDto)
  tags: TagDto[];

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus = PostStatus.DRAFT;

  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility = PostVisibility.PRIVATE;

  @ValidateIf((o) => o.status === PostStatus.SCHEDULED)
  @IsNotEmpty({ message: 'scheduledAt is required for scheduled posts' })
  @IsDateString()
  scheduledAt?: string;
}
