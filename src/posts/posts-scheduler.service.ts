import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Post } from 'src/models/post.model';
import { PostStatus } from 'src/commons/constants/post.constant';
import { Op } from 'sequelize';

@Injectable()
export class PostsSchedulerService {
  private readonly logger = new Logger(PostsSchedulerService.name);

  constructor(
    @InjectModel(Post)
    private readonly postsRepository: typeof Post,
  ) {}

  @Cron('*/1 * * * *') // Chạy mỗi phút
  async publishScheduledPosts() {
    try {
      const now = new Date();

      const scheduledPosts = await this.postsRepository.findAll({
        where: {
          status: PostStatus.SCHEDULED,
          scheduledAt: { [Op.lte]: now },
        },
      });

      for (const post of scheduledPosts) {
        await post.update({
          status: PostStatus.PUBLISHED,
          publishedAt: now,
        });

        this.logger.log(`Published scheduled post: ${post.id} - ${post.title}`);
      }

      if (scheduledPosts.length > 0) {
        this.logger.log(`Published ${scheduledPosts.length} scheduled posts`);
      }
    } catch (error) {
      this.logger.error('Error publishing scheduled posts:', error);
    }
  }
}
