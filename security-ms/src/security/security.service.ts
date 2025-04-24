import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateSecurityDto } from './dto/create-security.dto';
import { UpdateSecurityDto } from './dto/update-security.dto';
import { PrismaClient } from '@prisma/client';
import { NATS_SERVICE } from 'src/config/services.config';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class SecurityService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger(SecurityService.name);

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy
  ) {
    super()

  }

  async onModuleInit() {
    this.$connect();
    this.logger.log('MongoDb connected')

  }

  create(createSecurityDto: CreateSecurityDto) {
    return 'This action adds a new security';
  }

  findAll() {
    return `This action returns all security`;
  }

  findOne(id: number) {
    return `This action returns a #${id} security`;
  }

  update(id: number, updateSecurityDto: UpdateSecurityDto) {
    return `This action updates a #${id} security`;
  }

  remove(id: number) {
    return `This action removes a #${id} security`;
  }
}
