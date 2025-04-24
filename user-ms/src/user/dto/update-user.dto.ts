import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ArrayUnique, IsArray, IsDate, IsEnum, IsMongoId, isMongoId, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import {  Gender } from "../enums/user.enum"
import { Type } from "class-transformer";

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
