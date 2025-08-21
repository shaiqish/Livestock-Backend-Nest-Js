import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateLivestockDto } from './dto/create-livestock.dto';
import { UpdateLivestockDto } from './dto/update-livestock.dto';
import { Livestock } from './entities/livestock.entity';
import { Filter } from 'src/common/interfaces/Filter.interface';
import { applyFilters } from 'src/common/functions/applyFilters';

@Injectable()
export class LivestockService {
  private readonly logger = new Logger(LivestockService.name);

  constructor(private readonly dataSource: DataSource) {}

  async create(createLivestockDto: CreateLivestockDto): Promise<Livestock> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const livestock = queryRunner.manager.create(
        Livestock,
        createLivestockDto,
      );
      const savedLivestock = await queryRunner.manager.save(
        Livestock,
        livestock,
      );
      await queryRunner.commitTransaction();
      return savedLivestock;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to create livestock', error.stack);
      throw new InternalServerErrorException('Failed to create livestock');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    filters: Filter[],
    page: number,
    limit: number,
  ): Promise<Livestock[]> {
    const qb = this.dataSource
      .getRepository(Livestock)
      .createQueryBuilder('livestock');

    const result = await applyFilters(
      qb,
      filters,
      this.dataSource,
      'livestock',
      Livestock,
    )
      .skip((page - 1) * limit)
      .take(limit)
      .leftJoinAndSelect('livestock.feed', 'feed')
      .getMany();
    return result;
  }

  async findOne(id: string): Promise<Livestock> {
    const livestock = await this.dataSource
      .getRepository(Livestock)
      .findOne({ where: { id } });
    if (!livestock) {
      throw new NotFoundException(`Livestock with id ${id} not found`);
    }
    return livestock;
  }

  async update(
    id: string,
    updateLivestockDto: UpdateLivestockDto,
  ): Promise<Livestock> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const livestock = await queryRunner.manager.findOne(Livestock, {
        where: { id },
      });
      if (!livestock) {
        throw new NotFoundException(`Livestock with id ${id} not found`);
      }
      const updated = queryRunner.manager.merge(
        Livestock,
        livestock,
        updateLivestockDto,
      );
      const saved = await queryRunner.manager.save(Livestock, updated);
      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to update livestock id ${id}`, error.stack);
      throw new InternalServerErrorException('Failed to update livestock');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const livestock = await queryRunner.manager.findOne(Livestock, {
        where: { id },
      });
      if (!livestock) {
        throw new NotFoundException(`Livestock with id ${id} not found`);
      }
      await queryRunner.manager.remove(Livestock, livestock);
      await queryRunner.commitTransaction();
      return { deleted: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to delete livestock id ${id}`, error.stack);
      throw new InternalServerErrorException('Failed to delete livestock');
    } finally {
      await queryRunner.release();
    }
  }
}
