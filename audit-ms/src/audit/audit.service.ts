import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service'; // Ajusta la ruta según la estructura de tu proyecto
import { NATS_SERVICE } from '../config/services.config';
import { CreateAuditLogDto } from './dto/create-audit.dto';

@Injectable()
export class AuditService implements OnModuleInit {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  async onModuleInit() {
    await this.prisma.$connect();
    this.logger.log('MongoDB conectado en AuditService');
  }


  private handleError(error: any, defaultMessage: string): never {
    this.logger.error(error);
    throw new RpcException({
      status: 500,
      message: error?.message || defaultMessage,
    });
  }


  async createAuditLog(createAuditLogDto: CreateAuditLogDto){
    try {
      const auditLog = await this.prisma.auditLog.create({
        data: {
          evento: createAuditLogDto.evento,
          usuarioId: createAuditLogDto.usuarioId,
          entidadAfectada: createAuditLogDto.entidadAfectada,
          entidadId: createAuditLogDto.entidadId || '',
          detalles: createAuditLogDto.detalles,
          nivelRiesgo: createAuditLogDto.nivelRiesgo,
          ipAddress: createAuditLogDto.ipAddress || ''
        },
      });

      return auditLog;
    } catch (error) {
      this.handleError(error, 'Error al crear el registro de auditoría');
    }
  }


  async getAuditLogById(id: string) {
    try {
      const auditLog = await this.prisma.auditLog.findUnique({
        where: { id },
      });

      if (!auditLog) {
        throw new RpcException({
          status: 404,
          message: 'Registro de auditoría no encontrado',
        });
      }
      return auditLog;
    } catch (error) {
      this.handleError(error, 'Error al obtener el registro de auditoría');
    }
  }


  async getAllAuditLogs(){
    try {
      return await this.prisma.auditLog.findMany();
    } catch (error) {
      this.handleError(error, 'Error al obtener los registros de auditoría');
    }
  }


  async getAuditLogsByUser(userId: string){
    try {
      return await this.prisma.auditLog.findMany({
        where: { usuarioId:userId }
      });
    } catch (error) {
      this.handleError(error, 'Error al obtener los registros de auditoría del usuario');
    }
  }
}
