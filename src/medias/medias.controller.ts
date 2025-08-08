import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { S3Service } from './s3.service';
import { MediasService } from './medias.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DEFAULT_MAX_SIZE } from 'src/commons/constants/media.constant';

@Controller('medias')
export class MediasController {
  constructor(
    private readonly s3Service: S3Service,
    private readonly mediasService: MediasService,
  ) {}

  @Get('test-connection')
  async testConnection() {
    return this.s3Service.testConnection();
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: DEFAULT_MAX_SIZE },
    }),
  )
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: DEFAULT_MAX_SIZE }),
          new FileTypeValidator({
            fileType:
              /^(image\/(jpeg|png|webp|gif)|video\/(mp4|webm|quicktime))$/,
          }),
        ],
      }),
    )
    file: any,
  ) {
    return this.mediasService.upload(file);
  }
}
