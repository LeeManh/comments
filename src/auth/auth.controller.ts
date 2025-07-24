import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from 'src/commons/decorators/current-user.decorator';
import { User } from 'src/models/user.model';
import { RegisterUserDto } from './dtos/register-user.dto';
import { ResponseMessage } from 'src/commons/decorators/response-message.decorator';
import { PublicApi } from 'src/commons/decorators/public-api.decorator';
import { DeviceInfo } from 'src/commons/decorators/device-info.decorator';
import { LogoutDto } from './dtos/logout.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicApi()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Login success')
  @Post('login')
  async login(@CurrentUser() user: User, @DeviceInfo() deviceInfo: string) {
    return await this.authService.login(user, deviceInfo);
  }

  @PublicApi()
  @ResponseMessage('Register success')
  @Post('register')
  async register(
    @Body() registerUserDto: RegisterUserDto,
    @DeviceInfo() deviceInfo: string,
  ) {
    return await this.authService.register(registerUserDto, deviceInfo);
  }

  @ResponseMessage('Logout success')
  @Post('logout')
  async logout(@CurrentUser() user: User, @Body() logoutDto: LogoutDto) {
    return await this.authService.logout(user, logoutDto.refreshToken);
  }

  @PublicApi()
  @ResponseMessage('Refresh token success')
  @Post('refresh-token')
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @DeviceInfo() deviceInfo: string,
  ) {
    return await this.authService.refreshToken(
      refreshTokenDto.refreshToken,
      deviceInfo,
    );
  }
}
