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
  SeriesStatus,
  SeriesVisibility,
} from 'src/commons/constants/series.constant';

export class TagDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}

export class CreateSeriesDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsUrl()
  thumbnail: string;

  @IsArray()
  @IsUUID('4', { each: true })
  postIds: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagDto)
  tags: TagDto[];

  @IsOptional()
  @IsEnum(SeriesStatus)
  status?: SeriesStatus = SeriesStatus.DRAFT;

  @IsOptional()
  @IsEnum(SeriesVisibility)
  visibility?: SeriesVisibility = SeriesVisibility.PRIVATE;

  @ValidateIf((o) => o.status === SeriesStatus.SCHEDULED)
  @IsNotEmpty({ message: 'scheduledAt is required for scheduled series' })
  @IsDateString()
  scheduledAt?: string;
}
