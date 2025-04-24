import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ArcoStatus } from '../enums/personalData.enum';


export class UpdateARCORequestDto {
  @IsEnum(ArcoStatus)
  status: ArcoStatus;

  @IsOptional()
  @IsString()
  rejectReason?: string;
}