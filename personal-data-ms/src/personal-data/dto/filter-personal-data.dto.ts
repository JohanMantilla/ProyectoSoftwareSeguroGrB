// filter-personal-data.dto.ts
import { IsString, IsEnum, IsOptional, IsDate, IsBoolean, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterPersonalDataDto {
  @IsString()
  @IsOptional()
  @IsUUID()
  titularId?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  fechaDesde?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  fechaHasta?: Date;

  @IsBoolean()
  @IsOptional()
  incluirEliminados?: boolean;
}