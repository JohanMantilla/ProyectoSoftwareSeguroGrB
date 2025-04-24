import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NotificationModule } from '../src/notification/notification.module';
import { NotificationController } from '../src/notification/notification.controller';
import { NotificationService } from '../src/notification/notification.service';
import * as sendgrid from '@sendgrid/mail';
import { PasswordResetEmailDto } from '../src/notification/dto/password-reset-email.dto';

// Mock SendGrid
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

describe('NotificationController (e2e)', () => {
  let app: INestApplication;
  let notificationController: NotificationController;
  let notificationService: NotificationService;
  let mockSendGrid;

  beforeAll(async () => {
    // Mock SendGrid response
    mockSendGrid = {
      setApiKey: jest.fn(),
      send: jest.fn().mockResolvedValue([
        { statusCode: 202, headers: {}, body: {} }
      ]),
    };

    // Replace SendGrid with mock
    (sendgrid as any).setApiKey = mockSendGrid.setApiKey;
    (sendgrid as any).send = mockSendGrid.send;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [NotificationModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true
    }));

    notificationController = moduleFixture.get<NotificationController>(NotificationController);
    notificationService = moduleFixture.get<NotificationService>(NotificationService);

    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Password Reset Email', () => {
    it('should send password reset email successfully', async () => {
      const passwordResetEmailDto: PasswordResetEmailDto = {
        email: 'test@example.com',
        resetToken: 'test-reset-token'
      };

      const result = await notificationController.handlePasswordResetEmail(passwordResetEmailDto);

      expect(result).toEqual({
        message: 'Email sent successfully',
        statusCode: 202
      });

      // Verify SendGrid was called with correct parameters
      const sendGridCall = mockSendGrid.send.mock.calls[0][0];
      expect(sendGridCall).toMatchObject({
        to: passwordResetEmailDto.email,
        subject: 'Restablecer contraseña',
        text: expect.stringContaining(passwordResetEmailDto.resetToken),
        html: expect.stringContaining(passwordResetEmailDto.resetToken),
      });
    });

    it('should handle SendGrid error', async () => {
      // Mock SendGrid error
      mockSendGrid.send.mockRejectedValueOnce(new Error('SendGrid error'));

      const passwordResetEmailDto: PasswordResetEmailDto = {
        email: 'test@example.com',
        resetToken: 'test-reset-token'
      };

      await expect(
        notificationController.handlePasswordResetEmail(passwordResetEmailDto)
      ).rejects.toThrow('Failed to send email: SendGrid error');
    });

    it('should handle unexpected status code', async () => {
      // Mock SendGrid response with unexpected status code
      mockSendGrid.send.mockResolvedValueOnce([
        { statusCode: 500, headers: {}, body: {} }
      ]);

      const passwordResetEmailDto: PasswordResetEmailDto = {
        email: 'test@example.com',
        resetToken: 'test-reset-token'
      };

      await expect(
        notificationController.handlePasswordResetEmail(passwordResetEmailDto)
      ).rejects.toThrow('Unexpected status code: 500');
    });

   
  });
});