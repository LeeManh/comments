import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSeriesDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  thumbnail: string;

  @IsArray()
  @IsString({ each: true })
  postIds: string[];
}
