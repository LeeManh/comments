import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { BookmarkTargetType } from 'src/commons/constants/bookmark.constant';
import { QueryParamsDto } from 'src/commons/dtos/query-params.dto';

export class GetMyBookmarksParams extends QueryParamsDto {
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(BookmarkTargetType)
  @Type(() => Number)
  targetType: BookmarkTargetType;
}
