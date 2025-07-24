import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RefreshToken } from 'src/models/refresh-token.model';
import { CreateRefreshTokenDto } from './dtos/create-refresh-token.dto';
import { handleError } from 'src/commons/utils/error.util';
import { ConfigService } from '@nestjs/config';
import * as ms from 'ms';

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectModel(RefreshToken)
    private readonly refreshTokenRepository: typeof RefreshToken,
    private readonly configService: ConfigService,
  ) {}

  async create(createRefreshTokenDto: CreateRefreshTokenDto, userId: string) {
    try {
      const expiresAt = this.calculateExpiry();
      const refreshToken = await this.refreshTokenRepository.create({
        ...createRefreshTokenDto,
        expiresAt,
        userId,
        isRevoked: false,
      });

      return refreshToken;
    } catch (error) {
      handleError(error);
    }
  }

  async findByToken(token: string) {
    return await this.refreshTokenRepository.findOne({
      where: { token },
    });
  }

  async revoke(token: string, userId: string) {
    const refreshToken = await this.findByToken(token);

    const isInvalid =
      !refreshToken ||
      refreshToken.userId !== userId ||
      this.isExpired(refreshToken) ||
      this.isRevoked(refreshToken);

    if (isInvalid) throw new UnauthorizedException('Invalid refresh token');

    refreshToken.isRevoked = true;
    await refreshToken.save();
  }

  async revokeAll(userId: string) {
    return await this.refreshTokenRepository.update(
      { isRevoked: true },
      { where: { userId, isRevoked: false } },
    );
  }

  private calculateExpiry(): Date {
    const expiresIn = this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN');
    const now = new Date();
    const milliseconds = ms(expiresIn);
    return new Date(now.getTime() + milliseconds);
  }

  private isExpired(refreshToken: RefreshToken) {
    const now = new Date();
    return refreshToken.expiresAt < now;
  }

  private isRevoked(refreshToken: RefreshToken) {
    return refreshToken.isRevoked;
  }
}
