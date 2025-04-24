import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaClient } from '@prisma/client';
import { firstValueFrom, of } from 'rxjs';
import { NATS_SERVICE } from '../src/config/services.config';
import { envs } from '../src/config/envs.config';
import { RegisterUserDto } from '../src/auth/dto/register-user.dto';
import { LoginUserDto } from '../src/auth/dto/login-user.dto';
import { ChangePasswordDto } from '../src/auth/dto/change-password.dto';
import { ForgotPasswordDto } from '../src/auth/dto/forgot-password.dto';
import { ResetPasswordDto } from '../src/auth/dto/reset-password.dto';
import * as bcrypt from 'bcrypt';

class MockClientProxy {
  private handlers = new Map<string, Function>();

  public send(pattern: string, data: any) {
    const handler = this.handlers.get(pattern);
    if (!handler) {
      console.warn(`No handler registered for pattern: ${pattern}`);
      return of(null);
    }
    try {
      const result = handler(data);
      return of(result);
    } catch (error) {
      throw error;
    }
  }

  public setHandler(pattern: string, handler: Function) {
    this.handlers.set(pattern, handler);
  }
}

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let mockClientProxy: MockClientProxy;
  let prisma: PrismaClient;
  let mockUsers: Map<string, any>;
  let mockUserEmails: Map<string, any>;

  beforeAll(async () => {
    mockClientProxy = new MockClientProxy();
    mockUsers = new Map();
    mockUserEmails = new Map();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(NATS_SERVICE)
      .useValue(mockClientProxy)
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: envs.DATABASE_URL
        }
      }
    });

    await app.init();
  });

  beforeEach(async () => {
    await prisma.$transaction([
      prisma.refreshToken.deleteMany(),
      prisma.resetToken.deleteMany()
    ]);
    
    mockUsers.clear();
    mockUserEmails.clear();
    jest.clearAllMocks();

    // Setup mock handlers for user microservice
    mockClientProxy.setHandler('create.user', async (data) => {
      if (mockUserEmails.has(data.email)) {
        throw new Error('User already exists');
      }

      // Generate a valid MongoDB ObjectId
      const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
      const increment = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      const userId = timestamp + '0000000000' + increment;
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = {
        id: userId,
        name: data.name,
        email: data.email,
        password: hashedPassword,
        roles: ['USER_ROLE'],
        isActive: true
      };
      mockUsers.set(userId, user);
      mockUserEmails.set(data.email, user);
      return user;
    });

    mockClientProxy.setHandler('auth.register.user', async (registerUserDto) => {
      const user = await firstValueFrom(
        mockClientProxy.send('create.user', registerUserDto)
      );
      const { password, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      };
    });

    mockClientProxy.setHandler('find.user.by.email', async (email) => {
      const user = mockUserEmails.get(email);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    });

    mockClientProxy.setHandler('find.user.by.id', async (userId) => {
      const user = mockUsers.get(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    });

    mockClientProxy.setHandler('auth.login.user', async (loginUserDto) => {
      const user = await firstValueFrom(
        mockClientProxy.send('find.user.by.email', loginUserDto.email)
      );
      
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      const { password, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      };
    });

    mockClientProxy.setHandler('auth.verify.access.token', (token) => {
      if (token !== 'mock-access-token') {
        const error = new Error('Invalid Token');
        error.name = 'TokenError';
        throw error;
      }
      return { 
        user: { 
          id: 'mock-user-id',
          roles: ['USER_ROLE']
        }
      };
    });

    mockClientProxy.setHandler('update.user', async (data) => {
      const user = mockUsers.get(data.id);
      if (!user) {
        throw new Error('User not found');
      }
      const updatedUser = { ...user, ...data };
      mockUsers.set(data.id, updatedUser);
      if (updatedUser.email) {
        mockUserEmails.set(updatedUser.email, updatedUser);
      }
      return updatedUser;
    });

    mockClientProxy.setHandler('auth.invalidate.refresh.token', async (data) => {
      await prisma.refreshToken.deleteMany({
        where: {
          userId: data.userId,
          token: data.refreshToken
        }
      });
      return { success: true };
    });

    mockClientProxy.setHandler('auth.forgot.password', async (forgotPasswordDto) => {
      const user = await firstValueFrom(
        mockClientProxy.send('find.user.by.email', forgotPasswordDto.email)
      );

      if (!user) {
        throw new Error('User not found');
      }

      // Mock reset token creation
      const resetToken = 'mock-reset-token';
      await prisma.resetToken.create({
        data: {
          token: resetToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 20 * 60 * 1000),
        },
      });

      // Mock email service call
      await firstValueFrom(
        mockClientProxy.send('email.password.reset', {
          email: user.email,
          resetToken: resetToken
        })
      );

      return { success: true, message: 'Password reset email sent' };
    });

    mockClientProxy.setHandler('email.password.reset', async (data) => {
      return { message: 'Email sent successfully', statusCode: 200 };
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Registration and Authentication Flow', () => {
    it('should register, login, and handle tokens for a user', async () => {
      const registerUserDto: RegisterUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'StrongPass123!'
      };

      const registrationResult = await firstValueFrom(
        mockClientProxy.send('auth.register.user', registerUserDto)
      );

      expect(registrationResult).toHaveProperty('accessToken');
      expect(registrationResult).toHaveProperty('refreshToken');
      expect(registrationResult.user).toHaveProperty('id');
      expect(registrationResult.user.roles).toContain('USER_ROLE');

      const loginUserDto: LoginUserDto = {
        email: registerUserDto.email,
        password: registerUserDto.password
      };

      const loginResult = await firstValueFrom(
        mockClientProxy.send('auth.login.user', loginUserDto)
      );

      expect(loginResult).toHaveProperty('accessToken');
      expect(loginResult).toHaveProperty('refreshToken');

      const verifyAccessResult = await firstValueFrom(
        mockClientProxy.send('auth.verify.access.token', loginResult.accessToken)
      );

      expect(verifyAccessResult.user).toHaveProperty('id');
      expect(verifyAccessResult.user).toHaveProperty('roles');
    });
  });

  describe('Password Management', () => {
    let testUser;

    beforeEach(async () => {
      const registerUserDto = {
        name: 'Password Test User',
        email: 'password@test.com',
        password: 'StrongPass123!'
      };

      const registerResult = await firstValueFrom(
        mockClientProxy.send('auth.register.user', registerUserDto)
      );
      testUser = registerResult.user;
    });

    it('should change password successfully', async () => {
      const changePasswordDto: ChangePasswordDto = {
        userId: testUser.id,
        currentPassword: 'StrongPass123!',
        newPassword: 'NewStrongPass123!',
        confirmNewPassword: 'NewStrongPass123!'
      };

      mockClientProxy.setHandler('auth.change.password', async (data) => {
        if (data.newPassword !== data.confirmNewPassword) {
          throw new Error('New password and confirmation do not match');
        }
        return { message: 'Password changed successfully' };
      });

      const result = await firstValueFrom(
        mockClientProxy.send('auth.change.password', changePasswordDto)
      );

      expect(result).toHaveProperty('message', 'Password changed successfully');
    });

    it('should handle password mismatch in change password', async () => {
      const mismatchPasswordDto: ChangePasswordDto = {
        userId: testUser.id,
        currentPassword: 'StrongPass123!',
        newPassword: 'NewPass123!',
        confirmNewPassword: 'DifferentPass123!'
      };

      mockClientProxy.setHandler('auth.change.password', async (data) => {
        if (data.newPassword !== data.confirmNewPassword) {
          throw new Error('New password and confirmation do not match');
        }
        return { message: 'Password changed successfully' };
      });

      await expect(firstValueFrom(
        mockClientProxy.send('auth.change.password', mismatchPasswordDto)
      )).rejects.toThrow('New password and confirmation do not match');
    });

    it('should handle forgot password request', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: testUser.email
      };
  
      const result = await firstValueFrom(
        mockClientProxy.send('auth.forgot.password', forgotPasswordDto)
      );
  
      expect(result.success).toBe(true);
      expect(result.message).toBe('Password reset email sent');
  
      const resetToken = await prisma.resetToken.findFirst({
        where: { userId: testUser.id }
      });
      
      expect(resetToken).toBeTruthy();
      expect(resetToken.userId).toBe(testUser.id);
      expect(resetToken.token).toBe('mock-reset-token');
      expect(resetToken.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe('Error Handling', () => {
    it('should handle duplicate email registration', async () => {
      const registerUserDto: RegisterUserDto = {
        name: 'Test User',
        email: 'duplicate@test.com',
        password: 'StrongPass123!'
      };

      // First registration
      await firstValueFrom(
        mockClientProxy.send('auth.register.user', registerUserDto)
      );

      // Attempt duplicate registration
      await expect(firstValueFrom(
        mockClientProxy.send('auth.register.user', registerUserDto)
      )).rejects.toThrow('User already exists');
    });

    it('should handle invalid login credentials', async () => {
      const invalidLoginDto: LoginUserDto = {
        email: 'nonexistent@test.com',
        password: 'WrongPass123!'
      };

      await expect(firstValueFrom(
        mockClientProxy.send('auth.login.user', invalidLoginDto)
      )).rejects.toThrow('User not found');
    });

    it('should handle invalid token verification', async () => {
      const invalidToken = 'invalid-token';

      try {
        await firstValueFrom(
          mockClientProxy.send('auth.verify.access.token', invalidToken)
        );
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Invalid Token');
      }
    });
  });
});