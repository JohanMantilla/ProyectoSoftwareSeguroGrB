import { Controller, Get, Inject, Logger, Param, Post, UseGuards, Body } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../config/services.config';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enum/roles.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateAuditLogDto } from './dto/create-audit.dto';
import { firstValueFrom } from 'rxjs';

@Controller('audit')
export class AuditController {
  private readonly logger = new Logger(AuditController.name);

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE)
  @Post('create')
  async createAuditLog(@Body() createAuditLogDto: CreateAuditLogDto) {
    try {
      this.logger.log('Solicitud para crear un registro de auditoría recibida');
      const response = await firstValueFrom(
        this.client.send('audit.log.create', createAuditLogDto)
      );
      return response;
    } catch (error) {
      this.logger.error('Error al crear el registro de auditoría', error);
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE)
  @Get('find-by-id/:id')
  async getAuditLogById(@Param('id') id: string) {
    try {
      this.logger.log(`Solicitud para obtener registro de auditoría con ID: ${id}`);
      const response = await firstValueFrom(
        this.client.send('audit.log.get.one', id)
      );
      return response;
    } catch (error) {
      this.logger.error(`Error al obtener registro de auditoría con ID: ${id}`, error);
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE)
  @Get('find-all')
  async getAllAuditLogs() {
    try {
      this.logger.log('Solicitud para obtener todos los registros de auditoría recibida');
      const response = await firstValueFrom(
        this.client.send('audit.log.get.all', {})
      );
      return response;
    } catch (error) {
      this.logger.error('Error al obtener todos los registros de auditoría', error);
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN_ROLE)
  @Get('find-by-user/:usuarioId')
  async getAuditLogsByUser(@Param('usuarioId') usuarioId: string) {
    try {
      this.logger.log(`Solicitud para obtener registros de auditoría del usuario: ${usuarioId}`);
      const response = await firstValueFrom(
        this.client.send('audit.log.get.by.user',  usuarioId )
      );
      return response;
    } catch (error) {
      this.logger.error(`Error al obtener registros de auditoría del usuario: ${usuarioId}`, error);
      throw error;
    }
  }
}
