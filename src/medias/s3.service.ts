import {
  DeleteObjectCommand,
  ListBucketsCommand,
  PutObjectCommand,
  S3,
} from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  constructor(
    @Inject('S3_CLIENT') private readonly s3Client: S3,
    private readonly configService: ConfigService,
  ) {}

  async testConnection() {
    const response = await this.s3Client.send(new ListBucketsCommand({}));
    return response;
  }

  private getBucket() {
    const bucket = this.configService.get<string>('S3_BUCKET_NAME');
    if (!bucket) throw new Error('S3_BUCKET_NAME is not configured');
    return bucket;
  }

  async uploadBuffer(key: string, buffer: Buffer, contentType: string) {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.getBucket(),
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
    return { key };
  }

  async deleteObject(key: string) {
    await this.s3Client.send(
      new DeleteObjectCommand({ Bucket: this.getBucket(), Key: key }),
    );
    return { key };
  }

  getPublicUrl(key: string) {
    const bucket = this.getBucket();
    const region = this.configService.get<string>('S3_REGION');
    const host = `https://${bucket}.s3.${region}.amazonaws.com`;
    return `${host}/${encodeURI(key)}`;
  }
}
