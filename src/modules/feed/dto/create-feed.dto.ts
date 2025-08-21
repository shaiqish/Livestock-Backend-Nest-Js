import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
  Length,
  Min,
  IsArray,
} from 'class-validator';

export class CreateFeedDto {
  @IsString()
  @Length(1, 100)
  feedType: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsDate()
  @Type(() => Date)
  feedingDate: Date;

  @IsNumber()
  @Min(0)
  cost: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  livestockIds: string[];
}
