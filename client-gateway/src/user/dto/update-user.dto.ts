import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Gender } from 'src/common/enums/gender.enum';
import { IsDate, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  
    @IsOptional()
    @IsDate()
    lastLogin?: Date;

    @IsNumber()
    @IsOptional()
    age?: number;

    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;

    
}
