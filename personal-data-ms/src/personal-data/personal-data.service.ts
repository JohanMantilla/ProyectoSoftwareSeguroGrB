import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from '../config/services.config';
import { CreatePersonalDataDto } from './dto/create-personal-data.dto';
import { UpdatePersonalDataDto } from './dto/update-personal-data.dto';
import { PaginationDto } from './dto/pagination.dto';
import { CreateARCORequestDto } from './dto/create-arco-request.dto';
import { FilterARCORequestDto } from './dto/filter-arco-request.dto';
import { UpdateARCORequestDto } from './dto/update-arco-request.dto';
import { CreateSensitiveDataDto } from './dto/create-sensitive-data.dto';

@Injectable()
export class PersonalDataService extends PrismaClient {
  private readonly logger = new Logger('PersonalDataService');

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }

  private handleError(error: any, message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    this.logger.error(error);
    throw new RpcException({ status, message: error.message || message });
  }

  async create(createDto: CreatePersonalDataDto) {
    try {
      const data = await this.personalData.create({
        data: {
          ...createDto,
          titularId: createDto.titularId!
        }
      });

      await this.auditLog.create({
        data: {
          userId: createDto.titularId,
          dataType: 'PERSONAL_DATA',
          action: 'CREATE',
          changes: JSON.parse(JSON.stringify(createDto))
        }
      });

      return data;
    } catch (error) {
      this.handleError(error, 'Error creating personal data');
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { page = 1, limit = 10 } = paginationDto;
      const skip = (page - 1) * limit;

      const [total, data] = await Promise.all([
        this.personalData.count({ where: { isActive: true } }),
        this.personalData.findMany({
          where: { isActive: true },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        })
      ]);

      return {
        data,
        meta: {
          total,
          page,
          lastPage: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.handleError(error, 'Error fetching personal data');
    }
  }

  async findOne(id: string) {
    try {
      const data = await this.personalData.findUnique({
        where: { id, isActive: true }
      });

      if (!data) throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Personal data not found'
      });

      return data;
    } catch (error) {
      this.handleError(error, 'Error fetching personal data');
    }
  }

  async findByTitularId(titularId: string) {
    try {
      const data = await this.personalData.findMany({
        where: { titularId, isActive: true }
      });

      if (!data.length) throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'No personal data found for this titular'
      });

      return data;
    } catch (error) {
      this.handleError(error, 'Error fetching personal data');
    }
  }

  async update(id: string, updateDto: UpdatePersonalDataDto) {
    try {
      const data = await this.personalData.update({
        where: { id, isActive: true },
        data: updateDto
      });

      await this.auditLog.create({
        data: {
          userId: data.titularId,
          dataType: 'PERSONAL_DATA',
          action: 'UPDATE',
          changes: JSON.parse(JSON.stringify(updateDto))
        }
      });

      return data;
    } catch (error) {
      this.handleError(error, 'Error updating personal data');
    }
  }

  async remove(id: string) {
    try {
      const data = await this.personalData.update({
        where: { id },
        data: { isActive: false }
      });

      await this.auditLog.create({
        data: {
          userId: data.titularId,
          dataType: 'PERSONAL_DATA',
          action: 'DELETE',
          changes: { id }
        }
      });

      return { message: 'Personal data deleted successfully' };
    } catch (error) {
      this.handleError(error, 'Error deleting personal data');
    }
  }

  // Sensitive Data Methods
  async createSensitiveData(createDto: CreateSensitiveDataDto) {
    try {
      const data = await this.sensitiveData.create({
        data: {
          ...createDto,
          titularId: createDto.titularId!
        }
      });

      await this.auditLog.create({
        data: {
          userId: createDto.titularId,
          dataType: 'SENSITIVE_DATA',
          action: 'CREATE',
          changes: { ...createDto, descripcion: '**ENCRYPTED**' }
        }
      });

      return data;
    } catch (error) {
      this.handleError(error, 'Error creating sensitive data');
    }
  }

  // ARCO Request Methods
  async createARCORequest(createDto: CreateARCORequestDto) {
    try {
      return await this.arcoRequest.create({
        data: {
          ...createDto,
          titularId: createDto.titularId!
        }
      });
    } catch (error) {
      this.handleError(error, 'Error creating ARCO request');
    }
  }

  async findAllARCORequests(paginationDto: PaginationDto, filterDto?: FilterARCORequestDto) {
    try {
      const { page = 1, limit = 10 } = paginationDto;

      // Construimos el where de manera más segura
      const where: any = {};

      if (filterDto) {
        if (filterDto.titularId) where.titularId = filterDto.titularId;
        if (filterDto.tipo) where.tipo = filterDto.tipo;
        if (filterDto.status) where.status = filterDto.status;

        if (filterDto.dateFrom || filterDto.dateTo) {
          where.requestDate = {};
          if (filterDto.dateFrom) where.requestDate.gte = new Date(filterDto.dateFrom);
          if (filterDto.dateTo) where.requestDate.lte = new Date(filterDto.dateTo);
        }
      }

      const [total, data] = await Promise.all([
        this.arcoRequest.count({ where }),
        this.arcoRequest.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { requestDate: 'desc' }
        })
      ]);

      return {
        data,
        meta: {
          total,
          page,
          lastPage: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.handleError(error, 'Error fetching ARCO requests');
    }
  }

  async findOneARCORequest(id: string) {
    try {
      const request = await this.arcoRequest.findUnique({ where: { id } });
      if (!request) throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'ARCO request not found'
      });
      return request;
    } catch (error) {
      this.handleError(error, 'Error fetching ARCO request');
    }
  }

  async updateARCORequest(id: string, updateDto: UpdateARCORequestDto) {
    try {
      const request = await this.arcoRequest.update({
        where: { id },
        data: {
          ...updateDto,
          replyDate: updateDto.status !== 'PENDING' ? new Date() : undefined
        }
      });

      if (updateDto.status === 'COMPLETED') {
        await this.processARCORequest(request);
      }

      return request;
    } catch (error) {
      this.handleError(error, 'Error updating ARCO request');
    }
  }

  private async processARCORequest(request: any) {
    try {
      switch (request.tipo) {
        case 'ACCESO':
          await this.client.emit('arco.access', request);
          break;
        case 'RECTIFICACION':
          await this.client.emit('arco.rectification', request);
          break;
        case 'CANCELACION':
          await this.client.emit('arco.cancellation', request);
          break;
        case 'OPOSICION':
          await this.client.emit('arco.opposition', request);
          break;
      }
    } catch (error) {
      this.logger.error(`Error process ARCO request: ${error.message}`);
    }
  }
}