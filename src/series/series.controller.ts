import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SeriesService } from './series.service';
import { Roles } from 'src/commons/decorators/roles.decorator';
import { UserRole } from 'src/commons/constants/user.constant';
import { CreateSeriesDto } from './dtos/create-series.dto';
import { CurrentUser } from 'src/commons/decorators/current-user.decorator';
import { User } from 'src/models/user.model';
import { ResponseMessage } from 'src/commons/decorators/response-message.decorator';
import { QueryParamsDto } from 'src/commons/dtos/query-params.dto';
import { UpdateSeriesDto } from './dtos/update-series.dto';

@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Roles(UserRole.ADMIN)
  @ResponseMessage('Create series success')
  @Post()
  async create(
    @Body() createSeriesDto: CreateSeriesDto,
    @CurrentUser() user: User,
  ) {
    return this.seriesService.create(user.id, createSeriesDto);
  }

  @ResponseMessage('Get series success')
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.seriesService.findOne(id);
  }

  @ResponseMessage('Get list series success')
  @Get()
  async findAll(@Query() queryParamsDto: QueryParamsDto) {
    return this.seriesService.findAll(queryParamsDto);
  }

  @Roles(UserRole.ADMIN)
  @ResponseMessage('Update series success')
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSeriesDto: UpdateSeriesDto,
    @CurrentUser() user: User,
  ) {
    return this.seriesService.update(user.id, id, updateSeriesDto);
  }

  @Roles(UserRole.ADMIN)
  @ResponseMessage('Delete series success')
  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.seriesService.delete(user.id, id);
  }
}
