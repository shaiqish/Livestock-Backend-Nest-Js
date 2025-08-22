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
  Logger,
} from '@nestjs/common';
import { Filter } from 'src/common/interfaces/Filter.interface';
import { MedicationService } from './medication.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';

@Controller('medications')
export class MedicationController {
  private readonly logger = new Logger(MedicationController.name);

  constructor(private readonly medicationService: MedicationService) {}

  @Post('livestock/:livestockId')
  create(@Body() createMedicationDto: CreateMedicationDto) {
    return this.medicationService.create(createMedicationDto);
  }

  @Get()
  async findAll(
    @Query('filters') filters: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    let parsedFilters: Filter[] = [];

    try {
      parsedFilters = filters ? JSON.parse(filters) : [];
    } catch (err) {
      this.logger.error('Failed to parse filters:', err);
    }

    return this.medicationService.findAll(parsedFilters, page, limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.medicationService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMedicationDto: UpdateMedicationDto,
  ) {
    return this.medicationService.update(id, updateMedicationDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.medicationService.remove(id);
  }
}
