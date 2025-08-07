import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserRole } from 'src/commons/constants/user.constant';
import { Roles } from 'src/commons/decorators/roles.decorator';
import { CreateTagDto } from './dtos/create-tag.dto';
import { TagsService } from './tags.service';
import { ResponseMessage } from 'src/commons/decorators/response-message.decorator';
import { PublicApi } from 'src/commons/decorators/public-api.decorator';
import { UpdateTagDto } from './dtos/update-tag.dto';
import { QueryParamsDto } from 'src/commons/dtos/query-params.dto';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Roles(UserRole.ADMIN)
  @ResponseMessage('Create tag success')
  @Post()
  async create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Get()
  @PublicApi()
  @ResponseMessage('Get tags success')
  findAll(@Query() queryParamsDto: QueryParamsDto) {
    return this.tagsService.findAll(queryParamsDto);
  }

  @Get(':id')
  @PublicApi()
  @ResponseMessage('Get tag success')
  findOne(@Param('id') id: string) {
    return this.tagsService.fineOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Update tag success')
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(id, updateTagDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Delete tag success')
  remove(@Param('id') id: string) {
    return this.tagsService.delete(id);
  }
}
