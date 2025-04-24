import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NatsModule } from '../transports/nats.module';

@Module({
  imports: [PrismaModule, NatsModule], // Importamos PrismaModule y NatsModule
  controllers: [AuditController],
  providers: [AuditService],
})
export class AuditModule {}

