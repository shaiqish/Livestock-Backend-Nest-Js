import {
  IsString,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsInt,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LivestockTypeEnum } from 'src/common/enums/LivestockType.enum';
import { RegionEnum } from 'src/common/enums/Region.enum';
import { TagEnum } from 'src/common/enums/Tag.enum';

export class CreateLivestockDto {
  @IsString()
  name: string;

  @IsEnum(LivestockTypeEnum)
  breed: LivestockTypeEnum;

  @IsEnum(LivestockTypeEnum)
  sex: LivestockTypeEnum;

  @IsUUID()
  internalId: string;

  @IsEnum(LivestockTypeEnum)
  status: LivestockTypeEnum;

  @IsString()
  skinColor: string;

  @IsEnum(RegionEnum)
  neutered: RegionEnum;

  @IsBoolean()
  isBreedingStock: boolean;

  @IsNumber()
  weight: number;

  @IsString()
  description: string;

  @IsUUID()
  tagNumber: string;

  @IsEnum(TagEnum)
  tagColor: TagEnum;

  @IsEnum(TagEnum)
  tagLocation: TagEnum;

  @IsDate()
  @Type(() => Date)
  birthDate: Date;

  @IsNumber()
  birthWeight: number;

  @IsInt()
  ageToWean: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateWeaned?: Date;

  @IsEnum(TagEnum)
  origin: TagEnum;

  @IsOptional()
  @IsUUID()
  sire?: string;

  @IsOptional()
  @IsUUID()
  dam?: string;
}
