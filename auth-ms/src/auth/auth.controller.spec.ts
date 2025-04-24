import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // Mock del AuthService
  const authServiceMock = {
    registerUser: jest.fn(),
    loginUser: jest.fn(),
    invalidateRefreshToken: jest.fn(),
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
    refreshAccessToken: jest.fn(),
    changePassword: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should call authService.registerUser with correct dto', async () => {
      const registerUserDto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'John Doe'
      };
      const expectedResult = { id: '1', email: registerUserDto.email };
      
      authServiceMock.registerUser.mockResolvedValue(expectedResult);

      const result = await controller.registerUser(registerUserDto);

      expect(authServiceMock.registerUser).toHaveBeenCalledWith(registerUserDto);
      expect(result).toBe(expectedResult);
    });
  });

  describe('loginUser', () => {
    it('should call authService.loginUser with correct credentials', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'Password123!'
      };
      const expectedResult = {
        user: { id: '1', roles: ['USER'] },
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };

      authServiceMock.loginUser.mockResolvedValue(expectedResult);

      const result = await controller.loginUser(loginUserDto);

      expect(authServiceMock.loginUser).toHaveBeenCalledWith(loginUserDto);
      expect(result).toBe(expectedResult);
    });
  });

  describe('logoutUser', () => {
    it('should call authService.invalidateRefreshToken with correct parameters', async () => {
      const payload = {
        userId: '1',
        refreshToken: 'refresh-token'
      };
      const expectedResult = { success: true };

      authServiceMock.invalidateRefreshToken.mockResolvedValue(expectedResult);

      const result = await controller.logoutUser(payload);

      expect(authServiceMock.invalidateRefreshToken).toHaveBeenCalledWith(
        payload.userId,
        payload.refreshToken
      );
      expect(result).toBe(expectedResult);
    });
  });

  describe('verifyAccessToken', () => {
    it('should call authService.verifyAccessToken with correct token', async () => {
      const token = 'valid-access-token';
      const expectedResult = { user: { id: '1', roles: ['USER'] } };

      authServiceMock.verifyAccessToken.mockResolvedValue(expectedResult);

      const result = await controller.verifyAccessToken(token);

      expect(authServiceMock.verifyAccessToken).toHaveBeenCalledWith(token);
      expect(result).toBe(expectedResult);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should call authService.verifyRefreshToken with correct token', async () => {
      const token = 'valid-refresh-token';
      const expectedResult = { user: { id: '1', roles: ['USER'] } };

      authServiceMock.verifyRefreshToken.mockResolvedValue(expectedResult);

      const result = await controller.verifyRefreshToken(token);

      expect(authServiceMock.verifyRefreshToken).toHaveBeenCalledWith(token);
      expect(result).toBe(expectedResult);
    });
  });

  describe('refreshAccessToken', () => {
    it('should call authService.refreshAccessToken with correct refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const expectedResult = { accessToken: 'new-access-token' };

      authServiceMock.refreshAccessToken.mockResolvedValue(expectedResult);

      const result = await controller.refreshAccessToken(refreshToken);

      expect(authServiceMock.refreshAccessToken).toHaveBeenCalledWith(refreshToken);
      expect(result).toBe(expectedResult);
    });
  });

  describe('changePassword', () => {
    it('should call authService.changePassword with correct dto', async () => {
      const changePasswordDto: ChangePasswordDto = {
        userId: '1',
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmNewPassword: 'NewPassword123!'
      };
      const expectedResult = { success: true };

      authServiceMock.changePassword.mockResolvedValue(expectedResult);

      const result = await controller.changePassword(changePasswordDto);

      expect(authServiceMock.changePassword).toHaveBeenCalledWith(changePasswordDto);
      expect(result).toBe(expectedResult);
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword with correct dto', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com'
      };
      const expectedResult = { success: true };

      authServiceMock.forgotPassword.mockResolvedValue(expectedResult);

      const result = await controller.forgotPassword(forgotPasswordDto);

      expect(authServiceMock.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto);
      expect(result).toBe(expectedResult);
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword with correct dto', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        token: 'reset-token',
        password: 'NewPassword123!'
      };
      const expectedResult = { success: true };

      authServiceMock.resetPassword.mockResolvedValue(expectedResult);

      const result = await controller.resetPassword(resetPasswordDto);

      expect(authServiceMock.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
      expect(result).toBe(expectedResult);
    });
  });
});