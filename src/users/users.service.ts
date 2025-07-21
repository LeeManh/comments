import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY_TOKEN } from './users.provider';
import { User } from 'src/models/user.model';
import { CreateUserDto } from './dtos/create-user.dto';
import { hashPassword } from 'src/commons/utils/hash.util';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepository: typeof User,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.create({
      ...createUserDto,
      password: await hashPassword(createUserDto.password),
    });
    return user;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
}
