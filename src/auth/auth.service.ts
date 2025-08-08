import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from 'src/commons/types/token.type';
import { comparePassword } from 'src/commons/utils/hash.util';
import { User } from 'src/models/user.model';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDto } from './dtos/register-user.dto';
import { ConfigService } from '@nestjs/config';
import { RefreshTokensService } from 'src/refresh-tokens/refresh-tokens.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokensService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await comparePassword(password, user.password))) return user;
    return null;
  }

  async login(user: User, deviceInfo: string) {
    const { accessToken, refreshToken } = await this.generateToken(user);
    await this.refreshTokenService.create(
      { token: refreshToken, deviceInfo },
      user.id,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(registerUserDto: RegisterUserDto, deviceInfo: string) {
    const user = await this.usersService.create(registerUserDto);

    const { accessToken, refreshToken } = await this.generateToken(user);
    await this.refreshTokenService.create(
      { token: refreshToken, deviceInfo },
      user.id,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(user: User, refreshToken: string) {
    await this.refreshTokenService.revoke(refreshToken, user.id);
  }

  async refreshToken(oldRefreshToken: string, deviceInfo: string) {
    const token = await this.refreshTokenService.findByToken(oldRefreshToken);
    const user = await this.usersService.findById(token.userId);

    const { accessToken, refreshToken } = await this.generateToken(user);

    await this.refreshTokenService.revoke(oldRefreshToken, user.id);

    await this.refreshTokenService.create(
      { token: refreshToken, deviceInfo },
      user.id,
    );

    return { accessToken, refreshToken };
  }

  private async generateToken(user: User) {
    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(tokenPayload),
      this.jwtService.signAsync(tokenPayload, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
