import { IsNotEmpty, IsString, Min, MinLength } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;
}
