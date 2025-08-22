import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('group')
export class Group extends BaseEntity {
  @Column({ name: 'group_name', type: 'varchar', length: 100 })
  groupName: string;

  @Column({
    name: 'group_id_number',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  groupIdNumber: string;

  @Column({ name: 'number_of_livestock', type: 'int', default: 0 })
  numberOfLivestock: number;

  @Column({ type: 'text', nullable: true })
  remarks?: string;
}
