import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsOptional()
  @IsString()
  deviceInfo?: string;
}
