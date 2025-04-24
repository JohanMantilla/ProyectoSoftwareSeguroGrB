import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { ArcoStatus, TipoArco } from "../enums/personalData.enum";

export class FilterARCORequestDto {
  @IsOptional()
  @IsString()
  titularId?: string;

  @IsOptional()
  @IsEnum(TipoArco)
  tipo?: TipoArco;

  @IsOptional()
  @IsEnum(ArcoStatus)
  status?: ArcoStatus;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}