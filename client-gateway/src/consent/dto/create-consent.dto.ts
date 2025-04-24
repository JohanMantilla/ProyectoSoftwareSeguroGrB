import { IsString, IsArray, IsEnum, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';
import { BaseLegal, Finalidad } from '../enums/consent.enum';

export class CreateConsentDto {
  @IsString()
  @IsOptional()
  titularId: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  finalidades: string[];

  @IsEnum(BaseLegal)
  @IsNotEmpty()
  baseLegal: BaseLegal;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  datosTratados: string[];

  @IsString()
  @IsNotEmpty()
  version: string;
}