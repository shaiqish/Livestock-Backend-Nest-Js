import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { Feed } from './entities/feed.entity';
import { Livestock } from '../livestock/entities/livestock.entity';
import { Filter } from 'src/common/interfaces/Filter.interface';
import { applyFilters } from 'src/common/functions/applyFilters';

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(
    @InjectRepository(Feed)
    private readonly feedRepository: Repository<Feed>,
    @InjectRepository(Livestock)
    private readonly livestockRepository: Repository<Livestock>,
  ) {}

  async create(
    createFeedDto: CreateFeedDto,
  ): Promise<{ message: string; data: Feed }> {
    try {
      // ✅ bulk fetch instead of N+1
      const livestocks = await this.livestockRepository.findBy({
        id: In(createFeedDto.livestockIds),
      });

      if (livestocks.length !== createFeedDto.livestockIds.length) {
        const foundIds = livestocks.map((l) => l.id);
        const missingIds = createFeedDto.livestockIds.filter(
          (id) => !foundIds.includes(id),
        );
        throw new NotFoundException(
          `Livestock with IDs [${missingIds.join(', ')}] not found`,
        );
      }

      const feed = this.feedRepository.create({
        ...createFeedDto,
        livestocks,
      });

      const savedFeed = await this.feedRepository.save(feed);

      return {
        message: 'Feed record created successfully',
        data: savedFeed,
      };
    } catch (error) {
      this.logger.error(
        'Failed to create feed record',
        error instanceof Error ? error.stack : error,
      );
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to create feed record');
    }
  }

  async findAll(
    filters: Filter[],
    page?: number,
    limit?: number,
  ): Promise<{
    message: string;
    data: Feed[];
    meta?: { total: number; page: number; limit: number; totalPages: number };
  }> {
    try {
      const qb = this.feedRepository.createQueryBuilder('feed');
      qb.leftJoinAndSelect('feed.livestocks', 'livestocks');

      const filteredQb = applyFilters(
        qb,
        filters,
        this.feedRepository.manager.connection,
        'feed',
        Feed,
      ).orderBy('feed.createdAt', 'DESC');

      // Only apply pagination if both page and limit are provided
      if (page !== undefined && limit !== undefined) {
        const [items, total] = await filteredQb
          .skip((page - 1) * limit)
          .take(limit)
          .getManyAndCount();

        return {
          message: 'Feed records retrieved successfully',
          data: items,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        };
      }

      // Return all records without pagination
      const items = await filteredQb.getMany();
      return {
        message: 'Feed records retrieved successfully',
        data: items,
      };
    } catch (error) {
      this.logger.error(
        'Failed to retrieve feed records',
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to retrieve feed records');
    }
  }

  async findOne(id: string): Promise<{ message: string; data: Feed }> {
    try {
      const feed = await this.feedRepository.findOne({
        where: { id },
        relations: ['livestocks'],
      });

      if (!feed) {
        throw new NotFoundException(`Feed with ID ${id} not found`);
      }

      return {
        message: 'Feed record retrieved successfully',
        data: feed,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve feed record ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to retrieve feed record');
    }
  }

  async update(
    id: string,
    updateFeedDto: UpdateFeedDto,
  ): Promise<{ message: string; data: Feed }> {
    try {
      const feed = await this.feedRepository.findOne({
        where: { id },
        relations: ['livestocks'],
      });

      if (!feed) {
        throw new NotFoundException(`Feed with ID ${id} not found`);
      }

      if (updateFeedDto.livestockIds) {
        const livestocks = await this.livestockRepository.findBy({
          id: In(updateFeedDto.livestockIds),
        });

        if (livestocks.length !== updateFeedDto.livestockIds.length) {
          const foundIds = livestocks.map((l) => l.id);
          const missingIds = updateFeedDto.livestockIds.filter(
            (id) => !foundIds.includes(id),
          );
          throw new NotFoundException(
            `Livestock with IDs [${missingIds.join(', ')}] not found`,
          );
        }

        feed.livestocks = livestocks;
      }

      const updated = await this.feedRepository.save({
        ...feed,
        ...updateFeedDto,
      });

      return {
        message: 'Feed record updated successfully',
        data: updated,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update feed record ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to update feed record');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const feed = await this.feedRepository.findOne({ where: { id } });

      if (!feed) {
        throw new NotFoundException(`Feed with ID ${id} not found`);
      }

      await this.feedRepository.remove(feed);

      return { message: 'Feed record deleted successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to delete feed record ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to delete feed record');
    }
  }
}
