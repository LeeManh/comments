import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Gender } from 'src/commons/constants/user.constant';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  avatar: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  displayName: string;

  @IsOptional()
  @IsDateString()
  birthDay: string;

  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;
}
