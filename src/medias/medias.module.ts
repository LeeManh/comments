import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';
import { S3 } from '@aws-sdk/client-s3';
import { MediasController } from './medias.controller';
import { MediasService } from './medias.service';

@Module({
  providers: [
    {
      provide: 'S3_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const s3 = new S3({
          region: config.get<string>('S3_REGION'),
          credentials: {
            accessKeyId: config.get<string>('S3_ACCESS_KEY_ID'),
            secretAccessKey: config.get<string>('S3_SECRET_ACCESS_KEY'),
          },
        });
        return s3;
      },
    },
    S3Service,
    MediasService,
  ],
  controllers: [MediasController],
  exports: [S3Service],
})
export class MediasModule {}
