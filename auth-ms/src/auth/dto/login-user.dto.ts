import { PartialType } from '@nestjs/mapped-types';
import { IsDate, IsEmail, IsOptional, IsString, IsStrongPassword } from 'class-validator';

export class LoginUserDto  {

  @IsString()
  @IsEmail()
  email: string

  @IsString()
  @IsStrongPassword()
  password: string

  @IsOptional()
  ipAddress?:string 
}
