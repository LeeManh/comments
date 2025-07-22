import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';
import { models } from '../models';

export const databaseProviders: Provider[] = [
  {
    provide: 'SEQUELIZE',
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const sequelize = new Sequelize({
        dialect: configService.get('DB_DIALECT'),
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        logging: false,
      });

      sequelize.addModels(models ?? []);
      await sequelize.sync({ alter: true });

      return sequelize;
    },
  },
];
