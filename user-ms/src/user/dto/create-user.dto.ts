import { IsBoolean, IsEmail, IsOptional, IsString, IsStrongPassword } from "class-validator";

export class CreateUserDto {

    @IsString()
    name: string;

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @IsStrongPassword()
    password: string;

    @IsString()
    @IsOptional()
    avatarUrl?: string;


    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

}