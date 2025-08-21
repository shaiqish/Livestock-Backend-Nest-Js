import { Livestock } from 'src/modules/livestock/entities/livestock.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('butchers')
export class Butcher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  breed: string;

  @Column({ type: 'varchar', length: 20 })
  sex: string;

  @Column({ name: 'internal_id', type: 'varchar', length: 50, unique: true })
  internalId: string;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cause?: string;

  @OneToOne(() => Livestock, (livestock) => livestock.butcher)
  @JoinColumn()
  livestock: Livestock;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
