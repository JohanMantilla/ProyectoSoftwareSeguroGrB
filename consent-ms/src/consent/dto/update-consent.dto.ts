import { PartialType } from '@nestjs/mapped-types';
import { CreateConsentDto } from './create-consent.dto';
import { IsString, IsOptional, IsEnum, IsDate, IsMongoId, IsISO8601 } from 'class-validator';
import { EstadoConsent } from '@prisma/client';
import { Transform } from 'class-transformer';

export class UpdateConsentDto extends PartialType(CreateConsentDto) {
  @IsString()
  @IsOptional()
  @IsMongoId() // Valida que sea un ObjectId válido
  id?: string;

  @IsEnum(EstadoConsent)
  @IsOptional()
  estado?: EstadoConsent;

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : value)
  @IsDate()
  fechaRevocacion?: Date;
}