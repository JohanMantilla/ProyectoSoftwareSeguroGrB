import { IsEmail, IsNotEmpty, IsString } from "class-validator";


export class PasswordResetEmailDto{

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    resetToken: string;
}