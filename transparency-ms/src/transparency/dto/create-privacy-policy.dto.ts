import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePrivacyPolicyDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  responsable: string;
}