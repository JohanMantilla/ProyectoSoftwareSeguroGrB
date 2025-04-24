import { IsString, IsArray, IsEnum, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';
import { BaseLegal, Finalidad } from '@prisma/client';

export class CreateConsentDto {
  @IsString()
  @IsOptional()
  titularId: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  finalidades: Finalidad[];

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