import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLivestockDto } from './dto/create-livestock.dto';
import { UpdateLivestockDto } from './dto/update-livestock.dto';
import { Livestock } from './entities/livestock.entity';

@Injectable()
export class LivestockService {
  constructor(
    @InjectRepository(Livestock)
    private readonly livestockRepository: Repository<Livestock>,
  ) {}

  async create(createLivestockDto: CreateLivestockDto): Promise<Livestock> {
    const livestock = this.livestockRepository.create(createLivestockDto);
    return this.livestockRepository.save(livestock);
  }

  async findAll(): Promise<Livestock[]> {
    return this.livestockRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} livestock`;
  }

  update(id: number, updateLivestockDto: UpdateLivestockDto) {
    return `This action updates a #${id} livestock`;
  }

  remove(id: number) {
    return `This action removes a #${id} livestock`;
  }
}
