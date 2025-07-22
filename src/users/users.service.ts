import { QueryParamsDto } from 'src/commons/dtos/query-params.dto';
import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY_TOKEN } from './users.provider';
import { User } from 'src/models/user.model';
import { CreateUserDto } from './dtos/create-user.dto';
import { hashPassword } from 'src/commons/utils/hash.util';
import { handleError } from 'src/commons/utils/error.util';
import { Op, WhereOptions } from 'sequelize';
import { QueryUtil } from 'src/commons/utils/query.util';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepository: typeof User,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.userRepository.create({
        ...createUserDto,
        password: await hashPassword(createUserDto.password),
      });
      return user;
    } catch (error) {
      handleError(error, 'User');
    }
  }

  async findById(id: string) {
    return this.userRepository.findByPk(id);
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async findAll(queryParamsDto: QueryParamsDto) {
    const { page, limit, search } = queryParamsDto;

    const where: WhereOptions = {};
    if (search) {
      (where as any)[Op.or] = {
        email: { [Op.iLike]: `%${search}%` },
        username: { [Op.iLike]: `%${search}%` },
      };
    }

    const { count, rows: data } = await this.userRepository.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: QueryUtil.getOffset(page, limit),
      limit: limit,
    });

    const meta = QueryUtil.calculateMeta(page, limit, count);

    return { meta, data };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      if (updateUserDto.password) {
        updateUserDto.password = await hashPassword(updateUserDto.password);
      }

      await this.userRepository.update(updateUserDto, { where: { id } });
    } catch (error) {
      handleError(error, 'User');
    }
  }

  async delete(id: string) {
    await this.userRepository.destroy({ where: { id } });
  }
}
