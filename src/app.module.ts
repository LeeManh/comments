import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './commons/interceptors/transform.interceptor';
import { PostsModule } from './posts/posts.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CommentsModule } from './comments/comments.module';
import { RolesGuard } from './auth/guards/roles.guard';
import { RefreshTokensModule } from './refresh-tokens/refresh-tokens.module';
import { ReactionsModule } from './reactions/reactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    PostsModule,
    CommentsModule,
    RefreshTokensModule,
    ReactionsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
