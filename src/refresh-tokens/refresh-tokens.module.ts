import { Module } from '@nestjs/common';
import { RefreshTokensService } from './refresh-tokens.service';
import { DatabaseModule } from 'src/database/database.module';
import { RefreshToken } from 'src/models/refresh-token.model';

@Module({
  imports: [DatabaseModule.forFeature([RefreshToken])],
  providers: [RefreshTokensService],
  exports: [RefreshTokensService],
})
export class RefreshTokensModule {}
