import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { Livestock } from 'src/modules/livestock/entities/livestock.entity';
import { PaymentMethodEnum } from 'src/common/enums/PaymentMethod.enum';

@Entity('medications')
export class Medication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'varchar', length: 100 })
  brand: string;

  @Column({
    name: 'medication_brand',
    type: 'enum',
    enum: PaymentMethodEnum,
  })
  //mock enum should be changed later
  medicationBrand: PaymentMethodEnum;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  dosage?: string;

  @Column({
    type: 'enum',
    enum: PaymentMethodEnum,
  })
  //mock enum should be changed later
  method?: PaymentMethodEnum;

  @Column({
    name: 'administered_by',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  administeredBy?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost?: number;

  @Column({
    name: 'additional_cost',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  additionalCost?: number;

  @Column({ name: 'next_vaccination_date', type: 'date', nullable: true })
  nextVaccinationDate?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relationship with Livestock
  @ManyToMany(() => Livestock, (livestock) => livestock.medications, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  livestocks: Livestock[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
