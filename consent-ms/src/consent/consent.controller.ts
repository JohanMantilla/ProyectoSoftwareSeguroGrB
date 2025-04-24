import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConsentService } from './consent.service';
import { CreateConsentDto } from './dto/create-consent.dto';
import { UpdateConsentDto } from './dto/update-consent.dto';
import { Consent } from '@prisma/client';
import { MongoIdDto } from './dto/mongo-id.dto';

@Controller()
export class ConsentController {
  private readonly logger = new Logger(ConsentController.name);

  constructor(private readonly consentService: ConsentService) {}

  @MessagePattern('consent.create')
  async create(@Payload() createConsentDto: CreateConsentDto){
    this.logger.log(`Creando nuevo consentimiento para titular: ${createConsentDto.titularId}`);
    return await this.consentService.create(createConsentDto);
  }

  @MessagePattern('consent.findAll')
  async findAll(): Promise<Consent[]> {
    this.logger.log('Buscando todos los consentimientos');
    return await this.consentService.findAll();
  }

  @MessagePattern('consent.findOne')
  async findOne(@Payload() mongoIdDto: MongoIdDto) {
    this.logger.log(`Buscando consentimiento con ID: ${mongoIdDto.id}`);
    return this.consentService.findOne(mongoIdDto.id);
  }

  @MessagePattern('consent.findByTitular')
  async findByTitular(@Payload() data: { id: string }): Promise<Consent[]> {
  this.logger.log(`Buscando consentimientos del titular: ${data.id}`);
  return await this.consentService.findByTitular(data.id);
  }

  @MessagePattern('consent.update')
  async update(@Payload() payload: { id: string; data: UpdateConsentDto }): Promise<Consent> {
    this.logger.log(`Actualizando consentimiento ID: ${payload.id}`);
    return await this.consentService.update(payload.id, payload.data);
  }

  @MessagePattern('consent.updateRevokeDate')
  async updateRevokeDate(@Payload() payload: { id: string; data: UpdateConsentDto }): Promise<Consent> {
    this.logger.log(`Actualizando fecha de revocación del consentimiento ID: ${payload.id}`);
    return await this.consentService.updateRevokeDate(payload.id, payload.data);
  }

  @MessagePattern('consent.revoke')
  async revoke(@Payload() mongoIdDto: MongoIdDto): Promise<Consent> {
    this.logger.log(`Revocando consentimiento ID: ${mongoIdDto.id}`);
    return await this.consentService.revoke(mongoIdDto.id);
  }

  @MessagePattern('consent.aprove')
  async aprove(@Payload() mongoIdDto: MongoIdDto): Promise<Consent> {
    this.logger.log(`Aprobando consentimiento ID: ${mongoIdDto.id}`);
    return await this.consentService.aprove(mongoIdDto.id);
  }

  @MessagePattern('consent.reject')
  async reject(@Payload() mongoIdDto: MongoIdDto): Promise<Consent> {
    this.logger.log(`Rechazando consentimiento ID: ${mongoIdDto.id}`);
    return await this.consentService.reject(mongoIdDto.id);
  }

  @MessagePattern('consent.remove')
  async remove(@Payload() mongoIdDto: MongoIdDto) {
    this.logger.log(`Eliminando consentimiento ID: ${mongoIdDto.id}`);
    return this.consentService.remove(mongoIdDto.id);
  }

  @MessagePattern('consent.validate')
  async validateConsent(@Payload() payload: { titularId: string; finalidad: string }): Promise<boolean> {
    this.logger.log(`Validando consentimiento para titular: ${payload.titularId}, finalidad: ${payload.finalidad}`);
    const consentimientos = await this.consentService.findByTitular(payload.titularId);
    
    return consentimientos.some(consent => 
      consent.estado === 'ACTIVO' && 
      consent.finalidades.includes(payload.finalidad)
    );
  }

  @MessagePattern('consent.find.all.consent.logs')
  findAllConsentLogs( ) {
    return this.consentService.findAllConsentLogs();
  }
}