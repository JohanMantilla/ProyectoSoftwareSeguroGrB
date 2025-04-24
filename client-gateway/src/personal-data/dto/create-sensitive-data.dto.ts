import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { TipoSensible } from '../enums/personalData.enum';

export class CreateSensitiveDataDto {

  @IsOptional()
  @IsString()
  titularId?: string;  // Optional porque se asigna automáticamente desde el token
  
  @IsEnum(TipoSensible)
  tipo: TipoSensible;

  @IsString()
  descripcion: string;

  @IsString()
  purpose: string;

  @IsString()
  legalBasis: string;

  @IsOptional()
  @IsDateString()
  retentionTime?: Date;
}