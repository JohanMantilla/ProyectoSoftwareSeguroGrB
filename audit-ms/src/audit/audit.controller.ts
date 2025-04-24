import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit.dto';

@Controller()
export class AuditController {
  private readonly logger = new Logger(AuditController.name);

  constructor(private readonly auditService: AuditService) {}

  @MessagePattern('audit.log.create')
  async createAuditLog(@Payload() createAuditLogDto: CreateAuditLogDto) {
    this.logger.log('Mensaje recibido para crear registro de auditoría');
    return await this.auditService.createAuditLog(createAuditLogDto);
  }


  @MessagePattern('audit.log.get.one')
  async getAuditLogById(@Payload() id: string) {
    this.logger.log(`Mensaje recibido para obtener registro de auditoría con id: ${id}`);
    return await this.auditService.getAuditLogById(id);
  }


  @MessagePattern('audit.log.get.all')
  async getAllAuditLogs() {
    this.logger.log('Mensaje recibido para obtener todos los registros de auditoría');
    return await this.auditService.getAllAuditLogs();
  }


  @MessagePattern('audit.log.get.by.user')
  async getAuditLogsByUser(@Payload() usuarioId: string) {
    this.logger.log(`Mensaje recibido para obtener registros de auditoría del usuario: ${usuarioId}`);
    return await this.auditService.getAuditLogsByUser(usuarioId);
  }
}
