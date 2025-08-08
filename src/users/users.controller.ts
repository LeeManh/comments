import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { QueryParamsDto } from 'src/commons/dtos/query-params.dto';
import { Roles } from 'src/commons/decorators/roles.decorator';
import { UserRole } from 'src/commons/constants/user.constant';
import { ResponseMessage } from 'src/commons/decorators/response-message.decorator';
import { UpdateMeDto, UpdateUserDto } from './dtos/update-user.dto';
import { CurrentUser } from 'src/commons/decorators/current-user.decorator';
import { User } from 'src/models/user.model';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.ADMIN)
  @ResponseMessage('Get users success')
  @Get()
  async findAll(@Query() query: QueryParamsDto) {
    return this.usersService.findAll(query);
  }

  @ResponseMessage('Get profile success')
  @Get('me')
  async getMe(@CurrentUser() user: User) {
    return await this.usersService.getMe(user.id);
  }

  @ResponseMessage('Update profile success')
  @Patch('me')
  async updateMe(@CurrentUser() user: User, @Body() updateMeDto: UpdateMeDto) {
    return await this.usersService.updateMe(user.id, updateMeDto);
  }

  @Roles(UserRole.ADMIN)
  @ResponseMessage('Update user success')
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Roles(UserRole.ADMIN)
  @ResponseMessage('Delete user success')
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.delete(id);
  }
}
