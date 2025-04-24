import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from '../config/services.config';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import { of, throwError } from 'rxjs';
import { envs } from '../config/envs.config';



// Mocks
const jwtServiceMock = {
  sign: jest.fn(),
  verify: jest.fn(),
  verifyAsync: jest.fn()
};

const clientProxyMock = {
  send: jest.fn()
};

const prismaServiceMock = {
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn()
  },
  resetToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn()
  },
  $connect: jest.fn(),
  $transaction: jest.fn(callback => callback(prismaServiceMock))
};

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let clientProxy: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: jwtServiceMock
        },
        {
          provide: NATS_SERVICE,
          useValue: clientProxyMock
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    clientProxy = module.get<ClientProxy>(NATS_SERVICE);

    Object.assign(service, prismaServiceMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Token Generation and Verification', () => {
    const testPayload = {
      id: '123',
      roles: ['USER_ROLE']
    };

    describe('generateAccessToken', () => {
      it('should generate a valid access token with correct secret', async () => {
        const accessToken = 'test-access-token';
        jwtServiceMock.sign.mockReturnValue(accessToken);

        const result = await (service as any).generateAccessToken(testPayload);

        expect(jwtServiceMock.sign).toHaveBeenCalledWith(
          testPayload,
          {
            expiresIn: '20m',
            secret: envs.JWT_SECRET_ACCESS
          }
        );
        expect(result).toBe(accessToken);
      });
    });

    describe('generateRefreshToken', () => {
      it('should generate a valid refresh token with correct secret', async () => {
        const refreshToken = 'test-refresh-token';
        jwtServiceMock.sign.mockReturnValue(refreshToken);

        const result = await (service as any).generateRefreshToken(testPayload);

        expect(jwtServiceMock.sign).toHaveBeenCalledWith(
          testPayload,
          {
            expiresIn: '7d',
            secret: envs.JWT_SECRET_REFRESH
          }
        );
        expect(result).toBe(refreshToken);
      });
    });

    describe('generateResetToken', () => {
      it('should generate a valid reset token with correct secret', async () => {
        const resetToken = 'test-reset-token';
        jwtServiceMock.sign.mockReturnValue(resetToken);

        const result = await (service as any).generateResetToken(testPayload.id);

        expect(jwtServiceMock.sign).toHaveBeenCalledWith(
          { id: testPayload.id },
          {
            expiresIn: '15m',
            secret: envs.JWT_SECRET_RESET_PASSWORD
          }
        );
        expect(result).toBe(resetToken);
      });
    });
  });

  describe('Token Verification', () => {
    const validToken = 'valid-token';
    const testPayload = {
      id: '123',
      roles: ['USER_ROLE'],
      sub: 'test-subject',
      iat: Date.now(),
      exp: Date.now() + 3600000
    };

    describe('verifyAccessToken', () => {
      it('should verify a valid access token', async () => {
        jwtServiceMock.verify.mockReturnValue(testPayload);

        const result = await service.verifyAccessToken(validToken);

        expect(jwtServiceMock.verify).toHaveBeenCalledWith(
          validToken,
          { secret: envs.JWT_SECRET_ACCESS }
        );
        expect(result.user).toEqual({
          id: testPayload.id,
          roles: testPayload.roles
        });
      });

      it('should throw RpcException for invalid access token', async () => {
        jwtServiceMock.verify.mockImplementation(() => {
          throw new Error('Invalid token');
        });

        await expect(service.verifyAccessToken(validToken))
          .rejects
          .toThrow(RpcException);
      });
    });

    describe('verifyRefreshToken', () => {
      it('should verify a valid refresh token', async () => {
        jwtServiceMock.verify.mockReturnValue(testPayload);

        const result = await service.verifyRefreshToken(validToken);

        expect(jwtServiceMock.verify).toHaveBeenCalledWith(
          validToken,
          { secret: envs.JWT_SECRET_REFRESH }
        );
        expect(result.user).toEqual({
          id: testPayload.id,
          roles: testPayload.roles
        });
      });

      it('should throw RpcException for expired refresh token', async () => {
        jwtServiceMock.verify.mockImplementation(() => {
          throw new Error('Token expired');
        });

        await expect(service.verifyRefreshToken(validToken))
          .rejects
          .toThrow(RpcException);
      });
    });
  });

  // Pruebas de integración de flujos completos
  describe('Authentication Flows', () => {
    describe('Complete Login Flow', () => {
      const loginDto: LoginUserDto = {
        email: 'test@test.com',
        password: 'StrongPass123!'
      };

      it('should complete full login flow with token generation', async () => {
        const userId = '123';
        const userRoles = ['USER_ROLE'];
        const hashedPassword = await bcrypt.hash(loginDto.password, 10);
        const mockAccessToken = 'mock-access-token';
        const mockRefreshToken = 'mock-refresh-token';

        clientProxyMock.send.mockImplementationOnce((pattern, payload) => {
            expect(pattern).toBe('find.user.by.email');
            expect(payload).toBe(loginDto.email);
            return of({
                id: userId,
                roles: userRoles,
                password: hashedPassword
            });
        });
        clientProxyMock.send.mockImplementationOnce((pattern, payload) => {
            expect(pattern).toBe('update.user');
            expect(payload).toEqual({
                id: userId,
                updateUserDto: {
                    lastLogin: expect.any(Date)
                }
            });
            return of({ success: true });
        });

        jwtServiceMock.sign
          .mockReturnValueOnce(mockAccessToken)  // Para access token
          .mockReturnValueOnce(mockRefreshToken); // Para refresh token

        prismaServiceMock.refreshToken.create.mockResolvedValue({
          id: '1',
          token: mockRefreshToken,
          userId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
          
        const result = await service.loginUser(loginDto);

        expect(result).toEqual({
          user: { id: userId, roles: userRoles },
          accessToken: mockAccessToken,
          refreshToken: mockRefreshToken
        });

        // Verificar que el refresh token se guardó
        expect(prismaServiceMock.refreshToken.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            token: mockRefreshToken,
            userId
          })
        });
      });
    });

    describe('Password Reset Flow', () => {
      const resetEmail = 'test@test.com';
      const userId = '123';
      const newPassword = 'NewStrongPass123!';

      it('should complete full password reset flow', async () => {
        // 1. Forgot Password Request
        const forgotPasswordDto: ForgotPasswordDto = { email: resetEmail };
        const mockResetToken = 'mock-reset-token';

        clientProxyMock.send.mockReturnValueOnce(of({
          id: userId,
          email: resetEmail
        }));

        jwtServiceMock.sign.mockReturnValue(mockResetToken);

        clientProxyMock.send.mockReturnValueOnce(of({
          success: true,
          message: 'Reset email sent'
        }));

        const forgotResult = await service.forgotPassword(forgotPasswordDto);
        expect(forgotResult.success).toBe(true);

        // 2. Reset Password
        const resetPasswordDto: ResetPasswordDto = {
          token: mockResetToken,
          password: newPassword
        };

        jwtServiceMock.verifyAsync.mockResolvedValue({ id: userId });

        prismaServiceMock.resetToken.findUnique.mockResolvedValue({
          id: '1',
          userId,
          token: mockResetToken,
          isUsed: false,
          expiresAt: new Date(Date.now() + 3600000)
        });

        clientProxyMock.send.mockReturnValueOnce(of({
          id: userId,
          updated: true
        }));

        const resetResult = await service.resetPassword(resetPasswordDto);
        expect(resetResult.message).toBe('Password reset successfully');

        // Verificar que se revocaron los tokens antiguos
        expect(prismaServiceMock.refreshToken.updateMany).toHaveBeenCalledWith({
          where: { userId },
          data: expect.objectContaining({
            isRevoked: true
          })
        });
      });
    });
  });
});