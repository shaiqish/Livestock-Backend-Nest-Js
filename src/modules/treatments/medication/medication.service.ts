import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { Medication } from './entities/medication.entity';
import { Livestock } from 'src/modules/livestock/entities/livestock.entity';
import { Filter } from 'src/common/interfaces/Filter.interface';
import { applyFilters } from 'src/common/functions/applyFilters';

@Injectable()
export class MedicationService {
  private readonly logger = new Logger(MedicationService.name);

  constructor(
    @InjectRepository(Medication)
    private readonly medicationRepository: Repository<Medication>,
    @InjectRepository(Livestock)
    private readonly livestockRepository: Repository<Livestock>,
  ) {}

  async create(
    createMedicationDto: CreateMedicationDto,
  ): Promise<{ message: string; data: Medication }> {
    try {
      const livestocks = await this.livestockRepository.findBy({
        id: In(createMedicationDto.livestockIds),
      });

      // Check if any ID was not found
      if (livestocks.length !== createMedicationDto.livestockIds.length) {
        const foundIds = livestocks.map((l) => l.id);
        const missingIds = createMedicationDto.livestockIds.filter(
          (id) => !foundIds.includes(id),
        );
        throw new NotFoundException(
          `Livestock with IDs [${missingIds.join(', ')}] not found`,
        );
      }

      const medication = this.medicationRepository.create({
        ...createMedicationDto,
        livestocks,
      });

      const result = await this.medicationRepository.save(medication);

      return {
        message: 'Medication record created successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Failed to create medication record',
        error instanceof Error ? error.stack : error,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create medication record',
      );
    }
  }

  async findAll(
    filters: Filter[],
    page?: number,
    limit?: number,
  ): Promise<{
    message: string;
    data: Medication[];
    meta?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      const qb = this.medicationRepository.createQueryBuilder('medication');
      qb.leftJoinAndSelect('medication.livestocks', 'livestocks');

      const filteredQb = applyFilters(
        qb,
        filters,
        this.medicationRepository.manager.connection,
        'medication',
        Medication,
      ).orderBy('medication.date', 'DESC');

      // Only apply pagination if both page and limit are provided
      if (page !== undefined && limit !== undefined) {
        const [items, total] = await filteredQb
          .skip((page - 1) * limit)
          .take(limit)
          .getManyAndCount();

        return {
          message: 'Medication records retrieved successfully',
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
        message: 'Medication records retrieved successfully',
        data: items,
      };
    } catch (error) {
      this.logger.error(
        'Failed to retrieve medication records',
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve medication records',
      );
    }
  }

  async findOne(id: string): Promise<{ message: string; data: Medication }> {
    try {
      const medication = await this.medicationRepository.findOne({
        where: { id },
        relations: ['livestocks'],
      });

      if (!medication) {
        throw new NotFoundException(`Medication with ID ${id} not found`);
      }

      return {
        message: 'Medication record retrieved successfully',
        data: medication,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to retrieve medication record ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve medication record',
      );
    }
  }

  async update(
    id: string,
    updateMedicationDto: UpdateMedicationDto,
  ): Promise<{ message: string; data: Medication }> {
    try {
      const medication = await this.medicationRepository.findOne({
        where: { id },
        relations: ['livestocks'],
      });

      if (!medication) {
        throw new NotFoundException(`Medication with ID ${id} not found`);
      }

      // Update livestock relationships if provided
      if (updateMedicationDto.livestockIds) {
        const livestocks = await Promise.all(
          updateMedicationDto.livestockIds.map(async (livestockId) => {
            const livestock = await this.livestockRepository.findOne({
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
        medication.livestocks = livestocks;
      }

      const updatedMedication = this.medicationRepository.merge(
        medication,
        updateMedicationDto,
      );
      const result = await this.medicationRepository.save(updatedMedication);

      return {
        message: 'Medication record updated successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to update medication record ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException(
        'Failed to update medication record',
      );
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const medication = await this.medicationRepository.findOne({
        where: { id },
      });

      if (!medication) {
        throw new NotFoundException(`Medication with ID ${id} not found`);
      }

      await this.medicationRepository.remove(medication);

      return {
        message: 'Medication record deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to delete medication record ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException(
        'Failed to delete medication record',
      );
    }
  }
}
