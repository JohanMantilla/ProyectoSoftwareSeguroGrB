import { IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { TipoEvento, NivelRiesgo } from '../enums/audit.enum'; // Ajusta la ruta según la estructura de tu proyecto

export class CreateAuditLogDto {

  //ACCESO, MODIFICACION, ELIMINACION, VIOLACION_SEGURIDAD
  @IsEnum(TipoEvento)
  evento: TipoEvento;

  //id del usuario que realizo la accion
  @IsOptional()
  @IsString()
  usuarioId?: string;

  // Ej: "PersonalData", "Consent"
  @IsString()
  @IsNotEmpty()
  entidadAfectada: string;
  
  // id de la la entidad afecata, personalDataId, consentId, transparencyID
  @IsString()
  @IsOptional()
  entidadId?: string;

  // detalle de lo que se modifico
  @IsString()
  @IsNotEmpty()
  detalles: string;

  //BAJO, MEDIO, ALTO
  @IsOptional()
  @IsEnum(NivelRiesgo)
  nivelRiesgo?: NivelRiesgo;

  @IsString()
  @IsOptional()
  ipAddress?: string;
}
