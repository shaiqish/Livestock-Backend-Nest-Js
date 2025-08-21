import { IsString, IsInt, IsOptional, Min, Length } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @Length(1, 100)
  groupName: string;

  @IsString()
  @Length(1, 50)
  groupIdNumber: string;

  @IsInt()
  @Min(0)
  numberOfLivestock: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
