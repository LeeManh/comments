import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { QueryParamsDto } from 'src/commons/dtos/query-params.dto';
import {
  SeriesStatus,
  SeriesVisibility,
} from 'src/commons/constants/series.constant';

export class SeriesQueryParamsDto extends QueryParamsDto {
  @IsOptional()
  @Type(() => Number)
  @IsEnum(SeriesStatus)
  status?: SeriesStatus;

  @IsOptional()
  @Type(() => Number)
  @IsEnum(SeriesVisibility)
  visibility?: SeriesVisibility;
}
