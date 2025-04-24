import { IsEmail, IsNotEmpty, IsString } from "class-validator";


export class ForgotPasswordDto{

    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email:string
}