import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { Filter } from 'src/common/interfaces/Filter.interface';
import { applyFilters } from 'src/common/functions/applyFilters';

@Injectable()
export class GroupService {
  private readonly logger = new Logger(GroupService.name);

  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async create(
    createGroupDto: CreateGroupDto,
  ): Promise<{ message: string; data: Group }> {
    try {
      const group = await this.groupRepository.save(createGroupDto);

      return {
        message: 'Group created successfully',
        data: group,
      };
    } catch (error) {
      this.logger.error(
        'Failed to create group',
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to create group');
    }
  }

  async findAll(
    filters: Filter[],
    page?: number,
    limit?: number,
  ): Promise<{
    message: string;
    data: Group[];
    meta?: { total: number; page: number; limit: number; totalPages: number };
  }> {
    try {
      const qb = this.groupRepository.createQueryBuilder('group');

      const filteredQb = applyFilters(
        qb,
        filters,
        this.groupRepository.manager.connection,
        'group',
        Group,
      );

      // Only apply pagination if both page and limit are provided
      if (page !== undefined && limit !== undefined) {
        const [items, total] = await filteredQb
          .skip((page - 1) * limit)
          .take(limit)
          .getManyAndCount();

        return {
          message: 'Groups retrieved successfully',
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
        message: 'Groups retrieved successfully',
        data: items,
      };
    } catch (error) {
      this.logger.error(
        'Failed to retrieve groups',
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to retrieve groups');
    }
  }

  async findOne(id: string): Promise<{ message: string; data: Group }> {
    try {
      const group = await this.groupRepository.findOne({ where: { id } });
      if (!group) {
        throw new NotFoundException(`Group with ID ${id} not found`);
      }

      return {
        message: 'Group retrieved successfully',
        data: group,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to retrieve group ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to retrieve group');
    }
  }

  async update(
    id: string,
    updateGroupDto: UpdateGroupDto,
  ): Promise<{ message: string; data: Group }> {
    try {
      const group = await this.groupRepository.findOne({ where: { id } });
      if (!group) {
        throw new NotFoundException(`Group with ID ${id} not found`);
      }

      const updatedGroup = await this.groupRepository.save({
        ...group,
        ...updateGroupDto,
      });

      return {
        message: 'Group updated successfully',
        data: updatedGroup,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to update group ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to update group');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const group = await this.groupRepository.findOne({ where: { id } });
      if (!group) {
        throw new NotFoundException(`Group with ID ${id} not found`);
      }

      await this.groupRepository.remove(group);

      return {
        message: 'Group deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to delete group ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to delete group');
    }
  }
}
