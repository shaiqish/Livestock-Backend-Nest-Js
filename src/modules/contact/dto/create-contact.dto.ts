import {
  IsString,
  IsEmail,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';

export class CreateContactDto {
  @IsString()
  @Length(1, 100)
  fullName: string;

  @IsEmail()
  @Length(5, 100)
  email: string;

  @IsString()
  @Length(7, 20)
  @Matches(/^\d+$/, { message: 'phoneNumber must contain only digits' })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @Length(7, 20)
  @Matches(/^\d+$/, { message: 'alternativeNumber must contain only digits' })
  alternativeNumber?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  designation?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  role?: string;

  @IsOptional()
  @IsString()
  @Length(1, 150)
  organizationCompany?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  province?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  division?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  district?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  tehsil?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(3, 20)
  postalCode?: string;
}
