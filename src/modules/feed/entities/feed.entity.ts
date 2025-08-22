import { Livestock } from 'src/modules/livestock/entities/livestock.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('feeds')
export class Feed extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  feedType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'date', name: 'feeding_date' })
  feedingDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @OneToMany(() => Livestock, (livestock) => livestock.feed)
  livestocks: Livestock[];
}
