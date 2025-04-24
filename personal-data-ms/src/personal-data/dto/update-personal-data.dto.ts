import { IsString, IsEmail, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class UpdatePersonalDataDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsString()
  legalBasis?: string;

  @IsOptional()
  @IsDateString()
  retentionTime?: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
