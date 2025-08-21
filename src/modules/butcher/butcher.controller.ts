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
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ButcherService } from './butcher.service';
import { CreateButcherDto } from './dto/create-butcher.dto';
import { UpdateButcherDto } from './dto/update-butcher.dto';

@Controller('butchers')
export class ButcherController {
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
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.butcherService.findAll(page, limit);
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
