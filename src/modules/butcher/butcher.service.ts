import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateButcherDto } from './dto/create-butcher.dto';
import { UpdateButcherDto } from './dto/update-butcher.dto';
import { Butcher } from './entities/butcher.entity';
import { Livestock } from '../livestock/entities/livestock.entity';

@Injectable()
export class ButcherService {
  private readonly logger = new Logger(ButcherService.name);

  constructor(
    @InjectRepository(Butcher)
    private readonly butcherRepository: Repository<Butcher>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createButcherDto: CreateButcherDto,
    livestockId: string,
  ): Promise<{ message: string; data: Butcher }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if butcher with same internalId exists
      const existing = await queryRunner.manager.findOne(Butcher, {
        where: { internalId: createButcherDto.internalId },
      });

      if (existing) {
        throw new ConflictException(
          `Livestock butchered with internal ID ${createButcherDto.internalId} already exists`,
        );
      }

      // Check if livestock exists
      const livestock = await queryRunner.manager.findOne(Livestock, {
        where: { id: livestockId },
      });

      if (!livestock) {
        throw new NotFoundException(
          `Livestock with ID ${livestockId} not found`,
        );
      }

      // Check if livestock is already butchered
      const existingButcher = await queryRunner.manager.findOne(Butcher, {
        where: { livestock: { id: livestockId } },
      });

      if (existingButcher) {
        throw new ConflictException(
          `Livestock with ID ${livestockId} is already butchered`,
        );
      }

      const butcher = queryRunner.manager.create(Butcher, {
        ...createButcherDto,
        livestock,
      });

      const savedButcher = await queryRunner.manager.save(Butcher, butcher);
      await queryRunner.commitTransaction();

      return {
        message: 'Butcher record created successfully',
        data: savedButcher,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        'Failed to create butcher record',
        error instanceof Error ? error.stack : error,
      );
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create butcher record');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    message: string;
    data: Butcher[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      const [butchers, total] = await this.butcherRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
        relations: ['livestock'],
      });

      return {
        message: 'Butcher records retrieved successfully',
        data: butchers,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(
        'Failed to retrieve butcher records',
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve butcher records',
      );
    }
  }

  async findOne(id: string): Promise<{ message: string; data: Butcher }> {
    try {
      const butcher = await this.butcherRepository.findOne({
        where: { id },
        relations: ['livestock'],
      });

      if (!butcher) {
        throw new NotFoundException(`Butcher with ID ${id} not found`);
      }

      return {
        message: 'Butcher record retrieved successfully',
        data: butcher,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to retrieve butcher record ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve butcher record',
      );
    }
  }

  async update(
    id: string,
    updateButcherDto: UpdateButcherDto,
  ): Promise<{ message: string; data: Butcher }> {
    try {
      const butcher = await this.butcherRepository.findOne({
        where: { id },
      });

      if (!butcher) {
        throw new NotFoundException(`Butcher with ID ${id} not found`);
      }

      // If internalId is being updated, check for conflicts
      if (
        updateButcherDto.internalId &&
        updateButcherDto.internalId !== butcher.internalId
      ) {
        const existing = await this.butcherRepository.findOne({
          where: { internalId: updateButcherDto.internalId },
        });
        if (existing) {
          throw new ConflictException(
            `Butcher with internal ID ${updateButcherDto.internalId} already exists`,
          );
        }
      }

      const updated = await this.butcherRepository.save({
        ...butcher,
        ...updateButcherDto,
      });

      return {
        message: 'Butcher record updated successfully',
        data: updated,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to update butcher record ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to update butcher record');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const butcher = await this.butcherRepository.findOne({
        where: { id },
      });

      if (!butcher) {
        throw new NotFoundException(`Butcher with ID ${id} not found`);
      }

      await this.butcherRepository.remove(butcher);

      return {
        message: 'Butcher record deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to delete butcher record ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to delete butcher record');
    }
  }
}
