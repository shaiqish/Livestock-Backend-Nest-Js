import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLivestockDto } from './dto/create-livestock.dto';
import { UpdateLivestockDto } from './dto/update-livestock.dto';
import { Livestock } from './entities/livestock.entity';
import { Filter } from 'src/common/interfaces/Filter.interface';
import { applyFilters } from 'src/common/functions/applyFilters';

@Injectable()
export class LivestockService {
  private readonly logger = new Logger(LivestockService.name);

  constructor(
    @InjectRepository(Livestock)
    private readonly livestockRepository: Repository<Livestock>,
  ) {}

  async create(createLivestockDto: CreateLivestockDto): Promise<Livestock> {
    try {
      const livestock = this.livestockRepository.create(createLivestockDto);
      const savedLivestock = await this.livestockRepository.save(livestock);
      return savedLivestock;
    } catch (error) {
      this.logger.error(
        'Failed to create livestock',
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to create livestock');
    }
  }

  async findAll(
    filters: Filter[],
    page?: number,
    limit?: number,
  ): Promise<Livestock[]> {
    const qb = this.livestockRepository
      .createQueryBuilder('livestock')
      .leftJoinAndSelect('livestock.feed', 'feed');

    const filteredQb = applyFilters(
      qb,
      filters,
      this.livestockRepository.manager.connection,
      'livestock',
      Livestock,
    );

    // Only apply pagination if both page and limit are provided
    if (page && limit) {
      filteredQb.skip((page - 1) * limit).take(limit);
    }

    return filteredQb.getMany();
  }

  async findOne(id: string): Promise<Livestock> {
    const livestock = await this.livestockRepository.findOne({ where: { id } });
    if (!livestock) {
      throw new NotFoundException(`Livestock with id ${id} not found`);
    }
    return livestock;
  }

  async update(
    id: string,
    updateLivestockDto: UpdateLivestockDto,
  ): Promise<Livestock> {
    try {
      const livestock = await this.livestockRepository.findOne({
        where: { id },
      });
      if (!livestock) {
        throw new NotFoundException(`Livestock with id ${id} not found`);
      }
      const updated = this.livestockRepository.merge(
        livestock,
        updateLivestockDto,
      );
      const saved = await this.livestockRepository.save(updated);
      return saved;
    } catch (error) {
      this.logger.error(
        `Failed to update livestock id ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to update livestock');
    }
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    try {
      const livestock = await this.livestockRepository.findOne({
        where: { id },
      });
      if (!livestock) {
        throw new NotFoundException(`Livestock with id ${id} not found`);
      }
      await this.livestockRepository.remove(livestock);
      return { deleted: true };
    } catch (error) {
      this.logger.error(
        `Failed to delete livestock id ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to delete livestock');
    }
  }
}
