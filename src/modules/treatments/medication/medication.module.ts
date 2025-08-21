import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicationService } from './medication.service';
import { MedicationController } from './medication.controller';
import { Medication } from './entities/medication.entity';
import { Livestock } from 'src/modules/livestock/entities/livestock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medication, Livestock])],
  controllers: [MedicationController],
  providers: [MedicationService],
})
export class MedicationModule {}
