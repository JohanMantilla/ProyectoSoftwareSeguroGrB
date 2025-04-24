import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { TipoSensible } from '../enums/personalData.enum';

export class UpdateSensitiveDataDto {
  @IsOptional()
  @IsEnum(TipoSensible)
  tipo?: TipoSensible;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsString()
  legalBasis?: string;

  @IsOptional()
  @IsDateString()
  retentionTime?: Date;
}