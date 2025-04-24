import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator"


export class ChangePasswordDto{

    @IsString()
    @IsNotEmpty()
    userId: string
    
    @IsString()
    @IsNotEmpty()
    currentPassword: string
    
    @IsString()
    @IsNotEmpty()
    @IsStrongPassword()
    newPassword: string
    
    @IsString()
    @IsNotEmpty()
    confirmNewPassword:string 
} 