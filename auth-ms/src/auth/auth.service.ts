import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { PrismaClient } from "@prisma/client";
import { JwtPayload } from "./interfaces/jwt-payload.interface";
import { RegisterUserDto } from "./dto/register-user.dto";
import { NATS_SERVICE } from "../config/services.config";
import { envs } from "../config/envs.config";
import * as bcrypt from 'bcrypt'
import { LoginUserDto } from "./dto/login-user.dto";
import { firstValueFrom, timeout, TimeoutError } from "rxjs";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from './dto/reset-password.dto';
import { NivelRiesgo, TipoEvento } from "./enums/audit.enum";

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

    private readonly logger = new Logger(AuthService.name);

     constructor(
        @Inject(NATS_SERVICE) private readonly client: ClientProxy,
        private readonly jwtService: JwtService
    ) {
        super()
    }
    async onModuleInit() {
        this.$connect()
        this.logger.log('MongoDb connected')
    }
    
    private handleError(error: any, defaultMessage: string, httpStatus: HttpStatus) {
        if (error instanceof RpcException) {
            throw error;
        }
        if (error instanceof TimeoutError) {
            throw new RpcException({
                status: HttpStatus.GATEWAY_TIMEOUT,
                message: 'Operation timed out',
            });
        }
        throw new RpcException({
            status: HttpStatus.INTERNAL_SERVER_ERROR || httpStatus,
            message: error.message || defaultMessage,
        });
    }
    private async generateTokens(payload: JwtPayload) {
        try {
            const accessToken = this.generateAccessToken(payload);
            const refreshToken = this.generateRefreshToken(payload);
            await this.saveRefreshToken(refreshToken, payload.id);
            return { accessToken, refreshToken };
        } catch (error) {
            this.handleError(error,'Error generating tokens', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    private generateAccessToken(payload: JwtPayload): string {
        try {
            return this.jwtService.sign(payload, {
                expiresIn: '20m',
                secret: envs.JWT_SECRET_ACCESS
            });

        } catch (error) {
            this.handleError(error,'Error generating access token', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    private generateResetToken(userId: string): string {
        try {
            return this.jwtService.sign({ id: userId }, {
                expiresIn: '15m',
                secret: envs.JWT_SECRET_RESET_PASSWORD
            });

        } catch (error) {
            this.handleError(error,'Error generating reset token',HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    private async saveRefreshToken(refreshToken: string, userId: string) {
        try {
            await this.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });
        } catch (error) {
            this.handleError(error,'Error saving refresh token',HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    private generateRefreshToken(payload: JwtPayload): string {
        try {
            return this.jwtService.sign(payload, {
                expiresIn: '7d',
                secret: envs.JWT_SECRET_REFRESH
            });

        } catch (error) {
            this.handleError(error,'Error saving refresh token',HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }


    private async revokeRefreshToken(id: string) {
        try {
            await this.refreshToken.update({
                where: { id },
                data: { isRevoked: true, updatedAt: new Date() }
            });
        } catch (error) {
            this.handleError(error,'Error revoking Refresh token',HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    private async revokeAllUserTokens(userId: string) {
        try {
            await this.refreshToken.updateMany({
                where: { userId },
                data: { isRevoked: true, updatedAt: new Date() },
            });
        } catch (error) {
            this.handleError(error,'Error revoke all Refresh tokens',HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async verifyAccessToken(token: string) {
        try {
            const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
                secret: envs.JWT_SECRET_ACCESS
            })
            const { id, roles } = user
            return { user: { id, roles } }
        } catch (error) {
            this.handleError(error,'Invalid Token', HttpStatus.UNAUTHORIZED)
        }
    }
    async verifyRefreshToken(token: string) {
        try {
            const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
                secret: envs.JWT_SECRET_REFRESH
            })
            const { id, roles } = user
            return { user: { id, roles } }
        } catch (error) {
            this.handleError(error,'Invalid Token', HttpStatus.UNAUTHORIZED)
        }
    }

    async invalidateRefreshToken(userId: string, refreshToken: string) {
        try {
            const tokenData = await this.refreshToken.findUnique({
                where: { token: refreshToken, userId }
            })
            if (!tokenData) {
                throw new RpcException({
                    status: HttpStatus.UNAUTHORIZED,
                    message: 'Invalid token or user'
                });
            }
            await this.revokeRefreshToken(tokenData.id)
            return {
                success: true
            }

        } catch (error) {
            this.handleError(error, 'An error occurred during token refresh', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async refreshAccessToken(refreshToken: string) {
        try {
            const storedRefreshToken = await this.refreshToken.findUnique({
                where: { token: refreshToken },
            });

            if (!storedRefreshToken) {
                throw new RpcException({
                    status: HttpStatus.UNAUTHORIZED,
                    message: 'Refresh token not found'
                });
            };

            if (new Date() > storedRefreshToken.expiresAt) {
                await this.revokeRefreshToken(storedRefreshToken.id)
                throw new RpcException({
                    status: HttpStatus.UNAUTHORIZED,
                    message: 'Refresh token has expired.  Please log in again.'
                });
            }

            if (storedRefreshToken.isRevoked) {
                throw new RpcException({
                    status: HttpStatus.UNAUTHORIZED,
                    message: 'Refresh token has been revoked'
                });
            }

            const payload = this.jwtService.verify(refreshToken, {
                secret: envs.JWT_SECRET_REFRESH
            });


            if (payload.id !== storedRefreshToken.userId) {
                await this.revokeRefreshToken(storedRefreshToken.id)
                throw new RpcException({
                    status: HttpStatus.UNAUTHORIZED,
                    message: 'Token mismatch. Please log in again.'
                });
            }
            const { id, roles } = payload
            const newAccessToken = this.generateAccessToken({ id, roles });
            return { accessToken: newAccessToken, refreshToken };

        } catch (error) {
            this.handleError(error, 'An error occurred during token refresh',HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }


    async registerUser(registerUserDto: RegisterUserDto) {
        const { name, email, password } = registerUserDto;
        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await firstValueFrom(
                this.client.send('create.user', {
                    email,
                    name,
                    password: hashedPassword
                }).pipe(timeout(5000))
            )
            const { roles, id } = newUser;
            const tokens = await this.generateTokens({ id, roles })
            const auditLog = {
                evento: TipoEvento.ACCESO,
                usuarioId: id,
                entidadAfectada: 'Microservicio de Autenticacion',
                detalles: `Registro de usuario en  el sistema ${new Date()}`,
                nivelRiesgo: NivelRiesgo.BAJO,
            }
            await firstValueFrom(
                 this.client.send('audit.log.create', auditLog)
            )
            return { user: { id, roles }, ...tokens }

        } catch (error) {
            this.handleError(error, 'Error while creating user',HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async loginUser(loginUserDto: LoginUserDto) {
        const { email, password } = loginUserDto
        try {
            const user = await firstValueFrom(
                this.client.send('find.user.by.email', email).pipe(timeout(5000))
            )
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new RpcException({
                    status: HttpStatus.BAD_REQUEST,
                    message: 'Invalid credentials'
                })
            }
            const { id, roles } = user
            const tokens = await this.generateTokens({ id, roles })

            await firstValueFrom(
                this.client.send('update.user',{id,updateUserDto:{lastLogin:new Date()}}).pipe(timeout(5000))
            )
            const auditLog = {
                evento: TipoEvento.ACCESO,
                usuarioId: id,
                entidadAfectada: 'Microservicio de Autenticacion',
                detalles: `Ingreso al sistema ${new Date()}`,
                nivelRiesgo: NivelRiesgo.BAJO,
                ipAddress: loginUserDto.ipAddress,

            }
            await firstValueFrom(
                 this.client.send('audit.log.create', auditLog)
            )
            return { user: { id, roles }, ...tokens }

        } catch (error) {
            this.logger.error(error)
            this.handleError(error, 'Invalid Credentials',HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }

    async findAllAuthLogs() {
        try {
            const authLogs = await this.logAuth.findMany()
            return authLogs;
        } catch (error) {
            this.handleError(error, 'Error fetching authentication logs', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async changePassword(changePasswordDto: ChangePasswordDto) {
        const { userId, currentPassword, newPassword, confirmNewPassword } = changePasswordDto;
        try {

            if (newPassword !== confirmNewPassword) {
                throw new RpcException({
                    status: HttpStatus.BAD_REQUEST,
                    message: 'New password and confirmation do not match'
                });
            }

            const user = await firstValueFrom(
                this.client.send('find.user.by.id', userId).pipe(timeout(5000))
            );
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

            if (!isPasswordValid) {
                throw new RpcException({
                    status: HttpStatus.BAD_REQUEST,
                    message: 'Invalid current password'
                });
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            const updatedUser = await firstValueFrom(
                this.client.send('update.user', { id: userId, password: hashedNewPassword }).pipe(timeout(5000))
            )

            await this.revokeAllUserTokens(userId);
            const auditLog = {
                evento: TipoEvento.MODIFICACION,
                usuarioId: userId,
                entidadAfectada: 'Microservicio de Autenticacion',
                detalles: `Cambio de contrasena en  el sistema ${new Date()}`,
                nivelRiesgo: NivelRiesgo.ALTO,

            }
            await firstValueFrom(
                 this.client.send('audit.log.create', auditLog)
            )
            return {
                message: 'Password changed successfully',
                ...updatedUser
            };
        } catch (error) {
            this.handleError(error, 'Error changing password', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async forgotPassword(forgotPassworddto: ForgotPasswordDto) {
        const { email } = forgotPassworddto;
        try {
            const user = await firstValueFrom(
                this.client.send('find.user.by.email', email).pipe(timeout(5000))
            );
            console.log(user )
            if (!user) {
                throw new RpcException({
                    status: HttpStatus.NOT_FOUND,
                    message: 'User not found'
                });
            }

            const resetToken = this.generateResetToken(user.id);

            await this.resetToken.create({
                data: {
                    token: resetToken,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20 min
                },
            });

            const emailService = await firstValueFrom(
                this.client.send('email.password.reset', {
                    email: user.email,
                    resetToken: resetToken
                }).pipe(timeout(5000))
            );

            return emailService;
        } catch (error) {
            this.handleError(error, 'Error processing forgot password request', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const { token, password: newPassword } = resetPasswordDto;
        try {
            await this.jwtService.verifyAsync(token, {
                secret: envs.JWT_SECRET_RESET_PASSWORD
            });

            const resetToken = await this.resetToken.findUnique({
                where: { token }
            });

            if (!resetToken || resetToken.isUsed || resetToken.expiresAt < new Date()) {
                throw new RpcException({
                    status: HttpStatus.BAD_REQUEST,
                    message: 'Invalid or expired reset token'
                });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);


            await this.$transaction(async (prismaTransaction) => {
                // Actualizar el usuario a través del microservicio
                await firstValueFrom(
                    this.client.send('update.user', {
                        id: resetToken.userId,
                        password: hashedPassword
                    }).pipe(timeout(5000))
                );

                // Actualizar el token de restablecimiento
                await prismaTransaction.resetToken.update({
                    where: { id: resetToken.id },
                    data: { isUsed: true }
                });
            });
            // Revocar todos los tokens del usuario
            await this.revokeAllUserTokens(resetToken.userId);

            return {
                message: 'Password reset successfully'
            };
        } catch (error) {
            this.logger.error(error)
            this.handleError(error, 'Error resetting password',HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

}
