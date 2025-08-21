import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { Medication } from './entities/medication.entity';
import { Livestock } from 'src/modules/livestock/entities/livestock.entity';

@Injectable()
export class MedicationService {
  constructor(
    @InjectRepository(Medication)
    private readonly medicationRepository: Repository<Medication>,
    @InjectRepository(Livestock)
    private readonly dataSource: DataSource,
  ) {}

  async create(createMedicationDto: CreateMedicationDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const livestocks = await Promise.all(
        createMedicationDto.livestockIds.map(async (id) => {
          const livestock = await queryRunner.manager.findOne(Livestock, {
            where: { id },
          });
          if (!livestock) {
            throw new NotFoundException(`Livestock with ID ${id} not found`);
          }
          return livestock;
        }),
      );

      const medication = this.medicationRepository.create({
        ...createMedicationDto,
        livestocks,
      });

      await Promise.all(
        livestocks.map((livestock) => {
          livestock.medications.push(medication);
          return queryRunner.manager.save(Livestock, livestock);
        }),
      );

      const result = await queryRunner.manager.save(medication);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'An error occurred while creating the medication record',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [items, total] = await this.medicationRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['livestock'],
      order: { date: 'DESC' },
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const medication = await this.medicationRepository.findOne({
      where: { id },
      relations: ['livestock'],
    });

    if (!medication) {
      throw new NotFoundException(`Medication with ID ${id} not found`);
    }

    return medication;
  }

  async update(id: string, updateMedicationDto: UpdateMedicationDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const medication = await this.medicationRepository.findOne({
        where: { id },
      });

      if (!medication) {
        throw new NotFoundException(`Medication with ID ${id} not found`);
      }

      const updatedMedication = this.medicationRepository.merge(
        medication,
        updateMedicationDto,
      );
      const result = await queryRunner.manager.save(updatedMedication);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'An error occurred while updating the medication record',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const medication = await this.medicationRepository.findOne({
        where: { id },
      });

      if (!medication) {
        throw new NotFoundException(`Medication with ID ${id} not found`);
      }

      await queryRunner.manager.remove(medication);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'An error occurred while deleting the medication record',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
