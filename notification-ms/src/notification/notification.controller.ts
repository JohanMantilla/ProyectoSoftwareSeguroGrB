import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import { SendEmailDto } from './dto/send-email.dto';
import { PasswordResetEmailDto } from './dto/password-reset-email.dto';


@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name)
  constructor(private readonly notificationService: NotificationService) {}

  
  @MessagePattern('email.password.reset')
  handlePasswordResetEmail(@Payload() passwordResetEmailDto:PasswordResetEmailDto) {
    return this.notificationService.sendEmail(passwordResetEmailDto);

  }
}
