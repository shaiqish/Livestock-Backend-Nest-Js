import { LivestockTypeEnum } from 'src/common/enums/LivestockType.enum';
import { RegionEnum } from 'src/common/enums/Region.enum';
import { TagEnum } from 'src/common/enums/Tag.enum';
import { DecimalToNumberTransformer } from 'src/common/tranformers/DecimalToNumber.tranformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('livestock')
export class Livestock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: LivestockTypeEnum })
  breed: LivestockTypeEnum;

  @Column({ type: 'enum', enum: LivestockTypeEnum })
  sex: LivestockTypeEnum;

  @Column({ type: 'uuid', name: 'internal_id', unique: true })
  internalId: string;

  @Column({ type: 'enum', enum: LivestockTypeEnum })
  status: LivestockTypeEnum;

  @Column({ type: 'varchar', length: 100, name: 'skin_color' })
  skinColor: string;

  @Column({ type: 'enum', enum: RegionEnum })
  neutered: RegionEnum;

  @Column({ type: 'boolean', name: 'is_breeding_stock', default: false })
  isBreedingStock: boolean;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: DecimalToNumberTransformer,
  })
  weight: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'uuid', name: 'tag_number', unique: true })
  tagNumber: string;

  @Column({ type: 'enum', enum: TagEnum, name: 'tag_color' })
  tagColor: TagEnum;

  @Column({ type: 'enum', enum: TagEnum, name: 'tag_location' })
  tagLocation: TagEnum;

  @Column({ type: 'date', name: 'birth_date' })
  birthDate: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: DecimalToNumberTransformer,
    name: 'birth_weight',
  })
  birthWeight: number;

  @Column({ type: 'int', name: 'age_to_wean' })
  ageToWean: number;

  @Column({ type: 'date', name: 'date_weaned', nullable: true })
  dateWeaned: Date;

  @Column({ type: 'enum', enum: TagEnum })
  origin: TagEnum;

  @Column({ type: 'uuid', nullable: true })
  sire: string; // Male Parent UUID (can be used to join later if needed)

  @Column({ type: 'uuid', nullable: true })
  dam: string; // Female Parent UUID (can be used to join later if needed)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
