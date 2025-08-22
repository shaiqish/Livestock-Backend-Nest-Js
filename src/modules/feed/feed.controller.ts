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
  Logger,
} from '@nestjs/common';
import { Filter } from 'src/common/interfaces/Filter.interface';
import { FeedService } from './feed.service';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';

@Controller('feed')
export class FeedController {
  private readonly logger = new Logger(FeedController.name);

  constructor(private readonly feedService: FeedService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createFeedDto: CreateFeedDto) {
    return this.feedService.create(createFeedDto);
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

    return this.feedService.findAll(parsedFilters, page, limit);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.feedService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFeedDto: UpdateFeedDto,
  ) {
    return this.feedService.update(id, updateFeedDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.feedService.remove(id);
  }
}
