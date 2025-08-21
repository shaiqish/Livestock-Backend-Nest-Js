import {
  IsEnum,
  IsNumber,
  IsString,
  IsDate,
  Length,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethodEnum } from 'src/common/enums/PaymentMethod.enum';

export class CreateSellDto {
  @IsNumber()
  price: number;

  @IsEnum(PaymentMethodEnum)
  paymentMethod: PaymentMethodEnum;

  @IsDate()
  @Type(() => Date)
  dateOfSale: Date;

  @IsNumber()
  depositAmount: number;

  @IsNumber()
  balanceDue: number;

  @IsString()
  zipCode: string;

  @IsString()
  termsAndConditions: string;

  // Buyer Contact fields
  @IsString()
  @Length(1, 100)
  buyerName: string;

  @IsString()
  @Length(5, 100)
  buyerEmail: string;

  @IsString()
  @Length(7, 20)
  @Matches(/^\d+$/, { message: 'buyerPhoneNumber must contain only digits' })
  buyerPhoneNumber: string;

  @IsString()
  @Length(1, 100)
  buyerCity: string;

  @IsString()
  @Length(1, 100)
  buyerState: string;

  @IsString()
  @Length(3, 20)
  buyerZipCode: string;

  @IsString()
  @Length(1, 100)
  buyerDesignation: string;

  // Point of Contact fields
  @IsString()
  @Length(1, 100)
  contactName: string;

  @IsString()
  @Length(7, 20)
  @Matches(/^\d+$/, { message: 'contactPhoneNumber must contain only digits' })
  contactPhoneNumber: string;

  @IsString()
  @Length(5, 100)
  contactEmail: string;

  @IsString()
  @Length(1, 255)
  contactAddress: string;

  @IsString()
  @Length(1, 100)
  contactRole: string;
}
