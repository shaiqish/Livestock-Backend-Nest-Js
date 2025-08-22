import { Livestock } from 'src/modules/livestock/entities/livestock.entity';
import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('butchers')
export class Butcher extends BaseEntity {
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
}
