import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Series } from 'src/models/series.model';
import { Op } from 'sequelize';
import { SeriesStatus } from 'src/commons/constants/series.constant';

@Injectable()
export class SeriesSchedulerService {
  private readonly logger = new Logger(SeriesSchedulerService.name);

  constructor(
    @InjectModel(Series)
    private readonly seriesRepository: typeof Series,
  ) {}

  @Cron('*/1 * * * *') // Chạy mỗi phút
  async publishScheduledSeries() {
    try {
      const now = new Date();

      const scheduledSeries = await this.seriesRepository.findAll({
        where: {
          status: SeriesStatus.SCHEDULED,
          scheduledAt: { [Op.lte]: now },
        },
      });

      for (const series of scheduledSeries) {
        await series.update({
          status: SeriesStatus.PUBLISHED,
          publishedAt: now,
        });

        this.logger.log(
          `✅ Published scheduled series: ${series.id} - "${series.title}"`,
        );
      }

      if (scheduledSeries.length > 0) {
        this.logger.log(`Published ${scheduledSeries.length} scheduled series`);
      }
    } catch (error) {
      this.logger.error('❌ Error publishing scheduled series:', error.stack);
    }
  }
}
