import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { NatsModule } from '../transports/nats.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [AuditController],
  imports: [NatsModule, AuthModule],
})
export class AuditModule {}
