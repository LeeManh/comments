import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Model } from 'sequelize-typescript';
import { models } from 'src/models';

@Global()
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: configService.getOrThrow('DB_DIALECT'),
        host: configService.getOrThrow('DB_HOST'),
        port: configService.getOrThrow('DB_PORT'),
        username: configService.getOrThrow('DB_USERNAME'),
        password: configService.getOrThrow('DB_PASSWORD'),
        database: configService.getOrThrow('DB_NAME'),
        logging: false,
        models: [...models],
        autoLoadModels: true,
        synchronize: configService.getOrThrow('NODE_ENV') === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {
  static forFeature(models: (typeof Model)[]) {
    return SequelizeModule.forFeature(models);
  }
}
