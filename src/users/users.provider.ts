import { Provider } from '@nestjs/common';
import { User } from '../models/user.model';

export const USER_REPOSITORY_TOKEN = 'USERS_REPOSITORY';

export const usersProviders: Provider[] = [
  {
    provide: USER_REPOSITORY_TOKEN,
    useValue: User,
  },
];
