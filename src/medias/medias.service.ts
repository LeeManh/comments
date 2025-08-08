import { Injectable } from '@nestjs/common';
import { S3Service } from './s3.service';
import { ALLOWED_IMAGE_TYPES } from 'src/commons/constants/media.constant';

@Injectable()
export class MediasService {
  constructor(private readonly s3Service: S3Service) {}

  async upload(file: any) {
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);

    const prefix = isImage ? 'images' : 'videos';
    const sanitizedName = file.originalname.replace(/\s+/g, '-');
    const key = `${prefix}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}-${sanitizedName}`;

    await this.s3Service.uploadBuffer(key, file.buffer, file.mimetype);
    const url = this.s3Service.getPublicUrl(key);
    return { url, mimeType: file.mimetype, size: file.size };
  }
}
