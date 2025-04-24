import { Controller, Get, Post, Body, Inject, UseGuards, Req, Res, UnauthorizedException, Patch, HttpStatus } from '@nestjs/common';
import { NATS_SERVICE } from '../config/services.config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { RegisterUserDto } from './dto/register-user.dto';
import {firstValueFrom } from 'rxjs';
import { LoginUserDto } from './dto/login-user.dto';
import { CurrentUser } from './interfaces/current-user.interface';
import { Token, User } from './decorators';
import { AuthGuard } from './guards/auth.guard';
import { Request, Response } from 'express';
import { Roles } from './decorators/roles.decorator';
import { Role } from './enum/roles.enum';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RefreshTokenGuard } from './guards/auth-refresh.guard';

@Controller('auth')
export class AuthController {

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy
  ) { }

  @Post('register')
  async registerUser(@Body() registerUserDto: RegisterUserDto, @Res({ passthrough: true }) res: Response) {
    try {
      const user = await firstValueFrom(
        this.client.send('auth.register.user', registerUserDto)
      )
      const { accessToken, refreshToken } = user;

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        path: '/api/auth',
      });

      return { accessToken };

    } catch (error) {
      throw new RpcException(error);
    }

  }

  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: Response, @Req() req: Request) {
    try {
      const ipAddressRaw = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const ipAddress = Array.isArray(ipAddressRaw) ? ipAddressRaw.join(', ') : ipAddressRaw;
      loginUserDto.ipAddress = ipAddress
      const user = await firstValueFrom(
        this.client.send('auth.login.user', loginUserDto)
      )
      const { accessToken, refreshToken } = user;

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        path: '/api/auth',
      });
      return {
        accessToken,
        message: 'Login successful'
      };
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE, Role.USER_ROLE)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response, @User() user: CurrentUser) {
    const refreshToken = req.cookies['refreshToken'];
    
    try { 
      await firstValueFrom(
        this.client.send('auth.invalidate.refresh.token', {
          refreshToken,
          userId:user.id
        })
      );
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/api/auth',
      });
      return { 
        statusCode: HttpStatus.OK,
        message: 'Logged out successfully' 
      };
    } catch (error) {
      throw new RpcException(error);
    }

  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPassworddto: ForgotPasswordDto) {
    try {
      const response = await firstValueFrom(
        this.client.send('auth.forgot.password', forgotPassworddto)
      )
      return response
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      const response = await firstValueFrom(
        this.client.send('auth.reset.password', resetPasswordDto)
      )
      return response;
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE, Role.USER_ROLE)
  @Patch('change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    try {
      const response = await firstValueFrom(
        this.client.send('auth.change.password', changePasswordDto)
      )
      return response;
    } catch (error) {
      throw new RpcException(error);
    }
  }


  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE, Role.USER_ROLE)
  @Get('verify')
  verifyToken(@User() user: CurrentUser, @Token() token: string) {
    return {
      user,
      token
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Roles(Role.ADMIN_ROLE, Role.USER_ROLE)
  @Post('refresh')
  async refreshAccessToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    try {
      const tokens = await firstValueFrom(
        this.client.send('auth.refresh.access.token', refreshToken)
      )
      const { accessToken } = tokens;

      return { accessToken };  

    } catch (error) {
      throw new RpcException(error)
    }

  }

}
