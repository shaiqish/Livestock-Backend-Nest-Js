import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { Feed } from './entities/feed.entity';
import { Livestock } from '../livestock/entities/livestock.entity';

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(
    @InjectRepository(Feed)
    private readonly feedRepository: Repository<Feed>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createFeedDto: CreateFeedDto,
  ): Promise<{ message: string; data: Feed }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if all livestocks exist
      const livestocks = await Promise.all(
        createFeedDto.livestockIds.map(async (id) => {
          const livestock = await queryRunner.manager.findOne(Livestock, {
            where: { id },
          });
          if (!livestock) {
            throw new NotFoundException(`Livestock with ID ${id} not found`);
          }
          return livestock;
        }),
      );

      const feed = queryRunner.manager.create(Feed, {
        feedType: createFeedDto.feedType,
        quantity: createFeedDto.quantity,
        feedingDate: createFeedDto.feedingDate,
        cost: createFeedDto.cost,
        note: createFeedDto.note,
        livestocks,
      });

      await Promise.all(
        livestocks.map((livestock) => {
          livestock.feed = feed;
          return queryRunner.manager.save(Livestock, livestock);
        }),
      );

      const savedFeed = await queryRunner.manager.save(Feed, feed);
      await queryRunner.commitTransaction();

      return {
        message: 'Feed record created successfully',
        data: savedFeed,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        'Failed to create feed record',
        error instanceof Error ? error.stack : error,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create feed record');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    message: string;
    data: Feed[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      const [feeds, total] = await this.feedRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
        relations: ['livestocks'],
      });

      return {
        message: 'Feed records retrieved successfully',
        data: feeds,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
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
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to retrieve feed record ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to retrieve feed record');
    }
  }

  async update(
    id: string,
    updateFeedDto: UpdateFeedDto,
  ): Promise<{ message: string; data: Feed }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const feed = await queryRunner.manager.findOne(Feed, {
        where: { id },
        relations: ['livestocks'],
      });

      if (!feed) {
        throw new NotFoundException(`Feed with ID ${id} not found`);
      }

      // If livestockIds are provided, update the relationships
      if (updateFeedDto.livestockIds) {
        const livestocks = await Promise.all(
          updateFeedDto.livestockIds.map(async (livestockId) => {
            const livestock = await queryRunner.manager.findOne(Livestock, {
              where: { id: livestockId },
            });
            if (!livestock) {
              throw new NotFoundException(
                `Livestock with ID ${livestockId} not found`,
              );
            }
            return livestock;
          }),
        );
        feed.livestocks = livestocks;
      }

      const updated = await queryRunner.manager.save(Feed, {
        ...feed,
        ...updateFeedDto,
      });

      await queryRunner.commitTransaction();

      return {
        message: 'Feed record updated successfully',
        data: updated,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to update feed record ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to update feed record');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const feed = await queryRunner.manager.findOne(Feed, {
        where: { id },
      });

      if (!feed) {
        throw new NotFoundException(`Feed with ID ${id} not found`);
      }

      await queryRunner.manager.remove(Feed, feed);
      await queryRunner.commitTransaction();

      return {
        message: 'Feed record deleted successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to delete feed record ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to delete feed record');
    } finally {
      await queryRunner.release();
    }
  }
}
