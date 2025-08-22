import { PaymentMethodEnum } from 'src/common/enums/PaymentMethod.enum';
import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('breed')
export class Breed extends BaseEntity {
  // ------------------ Breed Animal ------------------

  @Column({ type: 'date' })
  breedingDate: Date;

  @Column({ type: 'enum', enum: PaymentMethodEnum })
  breedingMethod: PaymentMethodEnum;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  breedingCost: number;

  // ------------------ Health and Management ------------------

  @Column({ type: 'varchar', length: 255 })
  preBreedingHealth: string;

  @Column({ type: 'enum', enum: PaymentMethodEnum })
  treatment: PaymentMethodEnum;

  @Column({ type: 'date' })
  estrusDetectionDate: Date;

  @Column({ type: 'varchar', length: 100 })
  estrusCycleLength: string;

  // ------------------ Pregnancy Monitoring ------------------

  @Column({ type: 'date' })
  checkDate: Date;

  @Column({ type: 'enum', enum: PaymentMethodEnum })
  status: PaymentMethodEnum;

  @Column({ type: 'date' })
  estimatedDueDate: Date;

  // ------------------ Breeding Outcome ------------------

  @Column({ type: 'enum', enum: PaymentMethodEnum })
  resultOfBreeding: PaymentMethodEnum;

  @Column({ type: 'int' })
  numberOfOffspring: number;
}
