import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateBreedDto } from './dto/create-breed.dto';
import { UpdateBreedDto } from './dto/update-breed.dto';
import { Breed } from './entities/breed.entity';

@Injectable()
export class BreedService {
  private readonly logger = new Logger(BreedService.name);

  constructor(private readonly dataSource: DataSource) {}

  async create(createBreedDto: CreateBreedDto): Promise<Breed> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const breed = queryRunner.manager.create(Breed, createBreedDto);
      const savedBreed = await queryRunner.manager.save(Breed, breed);
      await queryRunner.commitTransaction();
      return savedBreed;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to create breed', error.stack);
      throw new InternalServerErrorException('Failed to create breed');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Breed[]> {
    return this.dataSource.getRepository(Breed).find();
  }

  async findOne(id: string): Promise<Breed> {
    const breed = await this.dataSource
      .getRepository(Breed)
      .findOne({ where: { id } });
    if (!breed) {
      throw new NotFoundException(`Breed with id ${id} not found`);
    }
    return breed;
  }

  async update(id: string, updateBreedDto: UpdateBreedDto): Promise<Breed> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const breed = await queryRunner.manager.findOne(Breed, { where: { id } });
      if (!breed) {
        throw new NotFoundException(`Breed with id ${id} not found`);
      }
      const updated = queryRunner.manager.merge(Breed, breed, updateBreedDto);
      const saved = await queryRunner.manager.save(Breed, updated);
      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to update breed id ${id}`, error.stack);
      throw new InternalServerErrorException('Failed to update breed');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const breed = await queryRunner.manager.findOne(Breed, { where: { id } });
      if (!breed) {
        throw new NotFoundException(`Breed with id ${id} not found`);
      }
      await queryRunner.manager.remove(Breed, breed);
      await queryRunner.commitTransaction();
      return { deleted: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to delete breed id ${id}`, error.stack);
      throw new InternalServerErrorException('Failed to delete breed');
    } finally {
      await queryRunner.release();
    }
  }
}
