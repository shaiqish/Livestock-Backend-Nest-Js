import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBreedDto } from './dto/create-breed.dto';
import { UpdateBreedDto } from './dto/update-breed.dto';
import { Breed } from './entities/breed.entity';
import { Filter } from 'src/common/interfaces/Filter.interface';
import { applyFilters } from 'src/common/functions/applyFilters';

@Injectable()
export class BreedService {
  private readonly logger = new Logger(BreedService.name);

  constructor(
    @InjectRepository(Breed)
    private readonly breedRepository: Repository<Breed>,
  ) {}

  async create(
    createBreedDto: CreateBreedDto,
  ): Promise<{ message: string; data: Breed }> {
    try {
      const breed = this.breedRepository.create(createBreedDto);
      const savedBreed = await this.breedRepository.save(breed);

      return {
        message: 'Breed created successfully',
        data: savedBreed,
      };
    } catch (error) {
      this.logger.error(
        'Failed to create breed',
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to create breed');
    }
  }

  async findAll(
    filters: Filter[],
    page?: number,
    limit?: number,
  ): Promise<{
    message: string;
    data: Breed[];
    meta?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      const qb = this.breedRepository.createQueryBuilder('breed');

      const filteredQb = applyFilters(
        qb,
        filters,
        this.breedRepository.manager.connection,
        'breed',
        Breed,
      ).orderBy('breed.createdAt', 'DESC');

      // Only apply pagination if both page and limit are provided
      if (page !== undefined && limit !== undefined) {
        const [items, total] = await filteredQb
          .skip((page - 1) * limit)
          .take(limit)
          .getManyAndCount();

        return {
          message: 'Breeds retrieved successfully',
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
        message: 'Breeds retrieved successfully',
        data: items,
      };
    } catch (error) {
      this.logger.error(
        'Failed to retrieve breeds',
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to retrieve breeds');
    }
  }

  async findOne(id: string): Promise<{ message: string; data: Breed }> {
    try {
      const breed = await this.breedRepository.findOne({ where: { id } });

      if (!breed) {
        throw new NotFoundException(`Breed with id ${id} not found`);
      }

      return {
        message: 'Breed retrieved successfully',
        data: breed,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Failed to retrieve breed ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to retrieve breed');
    }
  }

  async update(
    id: string,
    updateBreedDto: UpdateBreedDto,
  ): Promise<{ message: string; data: Breed }> {
    try {
      const breed = await this.breedRepository.findOne({ where: { id } });
      if (!breed) {
        throw new NotFoundException(`Breed with id ${id} not found`);
      }

      const updated = this.breedRepository.merge(breed, updateBreedDto);
      const saved = await this.breedRepository.save(updated);

      return {
        message: 'Breed updated successfully',
        data: saved,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Failed to update breed ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to update breed');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const breed = await this.breedRepository.findOne({ where: { id } });
      if (!breed) {
        throw new NotFoundException(`Breed with id ${id} not found`);
      }

      await this.breedRepository.remove(breed);

      return { message: 'Breed deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Failed to delete breed ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to delete breed');
    }
  }
}
