import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [SecurityController],
  providers: [SecurityService],
  imports:[NatsModule]
})
export class SecurityModule {}
