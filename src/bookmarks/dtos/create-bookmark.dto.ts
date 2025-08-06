import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { BookmarkTargetType } from 'src/commons/constants/bookmark.constant';

export class CreateBookmarkDto {
  @IsNotEmpty()
  @IsUUID()
  targetId: string;

  @IsNotEmpty()
  @IsEnum(BookmarkTargetType)
  targetType: BookmarkTargetType;
}
