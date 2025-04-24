import { Transform } from 'class-transformer';
import { IsString, IsEmail, IsOptional, IsDateString } from 'class-validator';

export class CreatePersonalDataDto {
  @IsOptional()
  @IsString()
  titularId?: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsString()
  purpose: string;

  @IsString()
  legalBasis: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  retentionTime?: Date;
}