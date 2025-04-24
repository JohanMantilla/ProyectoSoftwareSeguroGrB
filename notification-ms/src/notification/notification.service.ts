import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as sendgrid from '@sendgrid/mail';
import { envs } from '../config/envs.config';
import { SendEmailDto } from './dto/send-email.dto';
import { RpcException } from '@nestjs/microservices';
import { PasswordResetEmailDto } from './dto/password-reset-email.dto';

@Injectable()
export class NotificationService {

  private readonly logger = new Logger('Notification-service')

  constructor() {
    sendgrid.setApiKey(envs.SENDGRID_API_KEY)
  }
  async sendEmail(passwordResetEmailDto: PasswordResetEmailDto) {
    
    const { email, resetToken } = passwordResetEmailDto;
  
    const msg = {
      to: email,
      from: {
        email: envs.SENDGRID_FROM_EMAIL,
        name:envs.SENDGRID_FROM_NAME
      },
      subject:'Restablecer contraseña' ,
      text: `Usa este token para restablecer tu contraseña: ${resetToken}`,
      html: `
        <p>Tu código de restablecimiento de contraseña es:</p>
        <h2>${resetToken}</h2>
        <p>Para restablecer tu contraseña:</p>
        <p>Si no has solicitado un restablecimiento de contraseña, puedes ignorar este correo.</p>
      `,
    };

    try {
      const [response] = await sendgrid.send(msg);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return { message: 'Email sent successfully', statusCode: response.statusCode };
      } else {
        throw new RpcException({
          message: `Unexpected status code: ${response.statusCode}`,
          status: HttpStatus.INTERNAL_SERVER_ERROR
        });
      }
    } catch (error) {
      
      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException({
        message: `Failed to send email: ${error.message}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR
      });
    }
  }
}
