import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { Filter } from 'src/common/interfaces/Filter.interface';
import { ButcherService } from './butcher.service';
import { CreateButcherDto } from './dto/create-butcher.dto';
import { UpdateButcherDto } from './dto/update-butcher.dto';

@Controller('butchers')
export class ButcherController {
  private readonly logger = new Logger(ButcherController.name);

  constructor(private readonly butcherService: ButcherService) {}

  @Post(':livestockId')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('livestockId', ParseUUIDPipe) livestockId: string,
    @Body() createButcherDto: CreateButcherDto,
  ) {
    return this.butcherService.create(createButcherDto, livestockId);
  }

  @Get()
  async findAll(
    @Query('filters') filters: string,
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    let parsedFilters: Filter[] = [];

    try {
      parsedFilters = filters ? JSON.parse(filters) : [];
    } catch (err) {
      this.logger.error('Failed to parse filters:', err);
    }

    return this.butcherService.findAll(parsedFilters, page, limit);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.butcherService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateButcherDto: UpdateButcherDto,
  ) {
    return this.butcherService.update(id, updateButcherDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.butcherService.remove(id);
  }
}
