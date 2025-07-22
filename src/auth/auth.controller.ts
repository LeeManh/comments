import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from 'src/commons/decorators/current-user.decorator';
import { User } from 'src/models/user.model';
import { RegisterUserDto } from './dtos/register-user.dto';
import { ResponseMessage } from 'src/commons/decorators/response-message.decorator';
import { PublicApi } from 'src/commons/decorators/public-api.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicApi()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login success')
  @Post('login')
  async login(@CurrentUser() user: User) {
    return await this.authService.login(user);
  }

  @PublicApi()
  @ResponseMessage('Register success')
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return await this.authService.register(registerUserDto);
  }
}
