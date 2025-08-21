import {
  IsDateString,
  IsEnum,
  IsString,
  IsNumber,
  IsInt,
  IsPositive,
} from 'class-validator';
import { PaymentMethodEnum } from 'src/common/enums/PaymentMethod.enum';

// Replace with your actual enums

export class CreateBreedDto {
  // ------------------ Breed Animal ------------------

  @IsDateString()
  breedingDate: Date;

  @IsEnum(PaymentMethodEnum)
  breedingMethod: PaymentMethodEnum;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  breedingCost: number;

  // ------------------ Health and Management ------------------

  @IsString()
  preBreedingHealth: string;

  @IsEnum(PaymentMethodEnum)
  treatment: PaymentMethodEnum;

  @IsDateString()
  estrusDetectionDate: Date;

  @IsString()
  estrusCycleLength: string;

  // ------------------ Pregnancy Monitoring ------------------

  @IsDateString()
  checkDate: Date;

  @IsEnum(PaymentMethodEnum)
  status: PaymentMethodEnum;

  @IsDateString()
  estimatedDueDate: Date;

  // ------------------ Breeding Outcome ------------------

  @IsEnum(PaymentMethodEnum)
  resultOfBreeding: PaymentMethodEnum;

  @IsInt()
  @IsPositive()
  numberOfOffspring: number;
}
