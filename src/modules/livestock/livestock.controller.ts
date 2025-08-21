import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Logger,
} from '@nestjs/common';
import { LivestockService } from './livestock.service';
import { CreateLivestockDto } from './dto/create-livestock.dto';
import { UpdateLivestockDto } from './dto/update-livestock.dto';
import { Filter } from 'src/common/interfaces/Filter.interface';

@Controller('livestock')
export class LivestockController {
  private readonly logger = new Logger(LivestockController.name);

  constructor(private readonly livestockService: LivestockService) {}

  @Post()
  async create(@Body() createLivestockDto: CreateLivestockDto) {
    return this.livestockService.create(createLivestockDto);
  }

  @Get()
  async findAll(
    @Query('filters') filters: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const start = Date.now();
    let parsedFilters: Filter[] = [];

    try {
      parsedFilters = filters ? JSON.parse(filters) : [];
    } catch (err) {
      console.error('Failed to parse filters:', err);
    }

    const result = await this.livestockService.findAll(
      parsedFilters,
      page,
      limit,
    );
    const end = Date.now();
    this.logger.log(`findAll executed in ${end - start}ms`);
    return result;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.livestockService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLivestockDto: UpdateLivestockDto,
  ) {
    return this.livestockService.update(id, updateLivestockDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.livestockService.remove(id);
  }
}
