import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async create(
    createGroupDto: CreateGroupDto,
  ): Promise<{ message: string; data: Group }> {
    const Group = this.groupRepository.create(createGroupDto);
    const savedGroup = await this.groupRepository.save(Group);
    return {
      message: 'Group created successfully',
      data: savedGroup,
    };
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    message: string;
    data: Group[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const skip = (page - 1) * limit;
    const [Groups, total] = await this.groupRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Groups retrieved successfully',
      data: Groups,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<{ message: string; data: Group }> {
    const Group = await this.groupRepository.findOne({ where: { id } });
    if (!Group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return {
      message: 'Group retrieved successfully',
      data: Group,
    };
  }

  async update(
    id: string,
    updateGroupDto: UpdateGroupDto,
  ): Promise<{ message: string; data: Group }> {
    const Group = await this.groupRepository.findOne({ where: { id } });
    if (!Group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    const updatedGroup = await this.groupRepository.save({
      ...Group,
      ...updateGroupDto,
    });

    return {
      message: 'Group updated successfully',
      data: updatedGroup,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const Group = await this.groupRepository.findOne({ where: { id } });
    if (!Group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    await this.groupRepository.remove(Group);
    return {
      message: 'Group deleted successfully',
    };
  }
}
