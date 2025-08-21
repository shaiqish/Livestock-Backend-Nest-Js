import {
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
  IsPositive,
  IsEnum,
  IsArray,
} from 'class-validator';
import { PaymentMethodEnum } from 'src/common/enums/PaymentMethod.enum';

export class CreateMedicationDto {
  @IsDateString()
  date: string;

  @IsString()
  brand: string;

  @IsEnum(PaymentMethodEnum)
  medicationBrand: PaymentMethodEnum;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  dosage?: string;

  @IsOptional()
  @IsEnum(PaymentMethodEnum)
  method?: PaymentMethodEnum;

  @IsOptional()
  @IsString()
  administeredBy?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  cost?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  additionalCost?: number;

  @IsOptional()
  @IsDateString()
  nextVaccinationDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  livestockIds: string[];
}
