import { PaymentMethodEnum } from 'src/common/enums/PaymentMethod.enum';
import { DecimalToNumberTransformer } from 'src/common/tranformers/DecimalToNumber.tranformer';
import { Livestock } from 'src/modules/livestock/entities/livestock.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Contact } from 'src/modules/contact/entities/contact.entity';

//Note : The enums used here were based on the frontend mock dropdowns, as the frontend wasn't complete yet so the enums are just mock right now. Can be changed when the actual dropdown data or values are known.

@Entity()
export class Sell extends BaseEntity {
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: DecimalToNumberTransformer,
  })
  price: number;

  @Column({ type: 'enum', enum: PaymentMethodEnum, name: 'payment_method' })
  paymentMethod: PaymentMethodEnum;

  @Column({ type: 'date', name: 'date_of_sale' })
  dateOfSale: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'deposit_amount',
    transformer: DecimalToNumberTransformer,
  })
  depositAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'balance_due',
    transformer: DecimalToNumberTransformer,
  })
  balanceDue: number;

  @Column({ type: 'varchar', length: 20, name: 'zip_code' })
  zipCode: string;

  @Column({ type: 'text', name: 'terms_and_conditions' })
  termsAndConditions: string;

  @OneToOne(() => Livestock, (livestock) => livestock.sell)
  @JoinColumn()
  livestock: Livestock;

  @ManyToOne(() => Contact, (buyerInfo) => buyerInfo.buyerSells)
  @JoinColumn({ name: 'buyer_contact_id' })
  buyerInfo: Contact;

  @ManyToOne(
    () => Contact,
    (pointOfContactInfo) => pointOfContactInfo.pointOfContactSells,
  )
  @JoinColumn({ name: 'point_of_contact_id' })
  pointOfContactInfo: Contact;
}
