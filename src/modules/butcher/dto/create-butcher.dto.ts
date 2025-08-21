import { IsString, IsDate, IsOptional, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateButcherDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsString()
  @Length(1, 100)
  breed: string;

  @IsString()
  @Length(1, 20)
  sex: string;

  @IsString()
  @Length(1, 50)
  internalId: string;

  @IsString()
  @Length(1, 50)
  status: string;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  cause?: string;
}
