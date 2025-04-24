import { IsString, IsEnum, IsOptional } from 'class-validator';
import { TipoArco } from '../enums/personalData.enum';


export class CreateARCORequestDto {
  @IsOptional()
  @IsString()
  titularId?: string;  // Se asigna automáticamente del token

  @IsEnum(TipoArco)
  tipo: TipoArco;

  @IsOptional()
  @IsString()
  rejectReason?: string;
}