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
import { Filter } from 'src/common/interfaces/Filter.interface';
import { BreedService } from './breed.service';
import { CreateBreedDto } from './dto/create-breed.dto';
import { UpdateBreedDto } from './dto/update-breed.dto';

@Controller('breed')
export class BreedController {
  private readonly logger = new Logger(BreedController.name);

  constructor(private readonly breedService: BreedService) {}

  @Post()
  create(@Body() createBreedDto: CreateBreedDto) {
    return this.breedService.create(createBreedDto);
  }

  @Get()
  async findAll(
    @Query('filters') filters: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    let parsedFilters: Filter[] = [];

    try {
      parsedFilters = filters ? JSON.parse(filters) : [];
    } catch (err) {
      this.logger.error('Failed to parse filters:', err);
    }

    return this.breedService.findAll(parsedFilters, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.breedService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBreedDto: UpdateBreedDto,
  ) {
    return this.breedService.update(id, updateBreedDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.breedService.remove(id);
  }
}
