import { Sell } from 'src/modules/sell/entities/sell.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('contacts')
export class Contact extends BaseEntity {
  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({
    name: 'alternative_number',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  alternativeNumber?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  designation?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  role?: string;

  @Column({
    name: 'organization_company',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  organizationCompany?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  province?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  division?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  district?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tehsil?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  postalCode?: string;

  @OneToMany(() => Sell, (sell) => sell.buyerInfo)
  buyerSells: Sell[];

  @OneToMany(() => Sell, (sell) => sell.pointOfContactInfo)
  pointOfContactSells: Sell[];
}
