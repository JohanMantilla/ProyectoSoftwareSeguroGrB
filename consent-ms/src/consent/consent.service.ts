import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { CreateConsentDto } from './dto/create-consent.dto';
import { UpdateConsentDto } from './dto/update-consent.dto';

@Injectable()
export class ConsentService extends PrismaClient {
  private readonly logger = new Logger('Consent-Service');

  constructor() {
    super();
  }

  private handleError(error: any, defaultMessage: string, httpStatus: HttpStatus) {
    this.logger.error(error);

    if (error instanceof RpcException) throw error;

    throw new RpcException({
      status: httpStatus || HttpStatus.INTERNAL_SERVER_ERROR,
      message: error.message || defaultMessage,
    });
  }

  async create(createConsentDto: CreateConsentDto) {
    try {
      const consent = await this.consent.create({
        data: {
          titularId: createConsentDto.titularId,
          finalidades: createConsentDto.finalidades,
          baseLegal: createConsentDto.baseLegal,
          datosTratados: createConsentDto.datosTratados,
          version: createConsentDto.version,
        },
      });

      // Registrar la acción en el log
      await this.consentLog.create({
        data: {
          consentId: consent.id,
          userId: createConsentDto.titularId,
          action: 'CREATED',
          details: 'Consentimiento creado',
        },
      });

      this.logger.log(`Consentimiento creado con ID: ${consent.id}`);
      return consent;
    } catch (error) {
      this.logger.error('Error al crear consentimiento', error);
      throw error;
    }
  }

  async findAll(): Promise<any[]> {
    try {
      const consents = await this.consent.findMany();

      this.logger.log(`Encontrados ${consents.length} consentimientos`);
      return consents;
    } catch (error) {
      this.handleError(
        error,
        'Error al obtener consentimientos',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string) {
    try {
      const consent = await this.consent.findUnique({
        where: { id },
      });

      if (!consent) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `Consentimiento con ID ${id} no encontrado`,
        });
      }

      this.logger.log(`Consentimiento encontrado con ID: ${consent.id}`);
      return consent;
    } catch (error) {
      this.handleError(
        error,
        'Error al obtener consentimiento',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByTitular(titularId: string): Promise<any[]> {
    try {
      const consents = await this.consent.findMany({
        where: { titularId}, 
      });

      this.logger.log(`Encontrados ${consents.length} consentimientos para el titular: ${titularId}`);
      return consents;
    } catch (error) {
      this.handleError(
        error,
        'Error al obtener consentimientos del titular',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateConsentDto: UpdateConsentDto) {
    try {
      const existingConsent = await this.findOne(id);

      const updatedConsent = await this.consent.update({
        where: { id },
        data: {
          titularId: updateConsentDto.titularId,
          finalidades: updateConsentDto.finalidades,
          baseLegal: updateConsentDto.baseLegal,
          datosTratados: updateConsentDto.datosTratados,
          version: updateConsentDto.version,
          estado: updateConsentDto.estado,
        },
      });

      // Registrar la acción en el log
      await this.consentLog.create({
        data: {
          consentId: id,
          userId: existingConsent.titularId,
          action: 'UPDATED',
          details: 'Consentimiento actualizado',
        },
      });

      this.logger.log(`Consentimiento actualizado con ID: ${updatedConsent.id}`);
      return updatedConsent;
    } catch (error) {
      this.logger.error('Error al actualizar consentimiento', error);
      throw error;
    }
  }

  async updateRevokeDate(id: string, updateConsentDto: UpdateConsentDto) {
    try {
      const existingConsent = await this.findOne(id);
  
      // Validar y convertir la fecha
      let fechaRevocacion: Date | null = null;
      if (updateConsentDto.fechaRevocacion) {
        fechaRevocacion = new Date(updateConsentDto.fechaRevocacion);
        if (isNaN(fechaRevocacion.getTime())) {
          throw new Error('Formato de fecha inválido');
        }
      }
  
      const updatedConsent = await this.consent.update({
        where: { id },
        data: { fechaRevocacion },
      });
  
      // Registrar la acción en el log
      await this.consentLog.create({
        data: {
          consentId: id,
          userId: existingConsent.titularId,
          action: 'REVOKED',
          details: 'Fecha de revocación actualizada',
        },
      });
  
      this.logger.log(`Fecha de revocación actualizada para el consentimiento con ID: ${updatedConsent.id}`);
      return updatedConsent;
    } catch (error) {
      this.logger.error('Error al actualizar la fecha de revocación del consentimiento', error);
      throw error;
    }
  }
  
  async findAllConsentLogs() {
    try {
        const authLogs = await this.consentLog.findMany();
        return authLogs;
    } catch (error) {
        this.handleError(error, 'Error fetching authentication logs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async revoke(id: string) {
    try {
      const existingConsent = await this.findOne(id);

      const revokedConsent = await this.consent.update({
        where: { id },
        data: {
          estado: 'REVOCADO',
          fechaRevocacion: new Date(),
        },
      });

      // Registrar la acción en el log
      await this.consentLog.create({
        data: {
          consentId: id,
          userId: existingConsent.titularId,
          action: 'REVOKED',
          details: 'Consentimiento revocado',
        },
      });

      this.logger.log(`Consentimiento revocado con ID: ${revokedConsent.id}`);
      return revokedConsent;
    } catch (error) {
      this.logger.error('Error al revocar consentimiento', error);
      throw error;
    }
  }

  async aprove(id: string) {
    try {
      const existingConsent = await this.findOne(id);

      const approvedConsent = await this.consent.update({
        where: { id },
        data: {
          estado: 'ACTIVO',
          fechaAprobacion: new Date(),
        },
      });

      // Registrar la acción en el log
      await this.consentLog.create({
        data: {
          consentId: id,
          userId : existingConsent.titularId,
          action: 'APPROVED',
          details: 'Consentimiento aprobado',
        },
      });

      this.logger.log(`Consentimiento aprobado con ID: ${approvedConsent.id}`);
      return approvedConsent;
    } catch (error) {
      this.logger.error('Error al aprobar consentimiento', error);
      throw error;
    }
  }

  async reject(id: string) {
    try {
      const existingConsent = await this.findOne(id);

      const rejectedConsent = await this.consent.update({
        where: { id },
        data: {
          estado: 'RECHAZADO',
        },
      });

      // Registrar la acción en el log
      await this.consentLog.create({
        data: {
          consentId: id,
          userId: existingConsent.titularId,
          action: 'REJECTED',
          details: 'Consentimiento rechazado',
        },
      });

      this.logger.log(`Consentimiento rechazado con ID: ${rejectedConsent.id}`);
      return rejectedConsent;
    } catch (error) {
      this.logger.error('Error al rechazar consentimiento', error);
      throw error;
    }
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const existingConsent = await this.findOne(id);
  
      await this.consent.delete({
        where: { id },
      });
  
      this.logger.log(`Consentimiento eliminado con ID: ${id}`);
      return { success: true, message: `Consentimiento con ID ${id} eliminado correctamente` };
    } catch (error) {
      this.handleError(
        error,
        'Error al eliminar consentimiento',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async validateConsent(titularId: string, finalidad: string): Promise<boolean> {
    try {
      const consents = await this.findByTitular(titularId);

      const isValid = consents.some(
        (consent) =>
          consent.estado === 'ACTIVO' && consent.finalidades.includes(finalidad),
      );

      this.logger.log(`Validación de consentimiento para titular ${titularId} y finalidad ${finalidad}: ${isValid}`);
      return isValid;
    } catch (error) {
      this.handleError(
        error,
        'Error al validar consentimiento',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}