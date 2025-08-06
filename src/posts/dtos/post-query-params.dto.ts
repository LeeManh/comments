import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { PostStatus } from 'src/commons/constants/post.constant';
import { QueryParamsDto } from 'src/commons/dtos/query-params.dto';
import { PostVisibility } from 'src/commons/constants/post.constant';

export class PostQueryParamsDto extends QueryParamsDto {
  @IsOptional()
  @Type(() => Number)
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @Type(() => Number)
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;
}
