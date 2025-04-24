import { Module } from '@nestjs/common';
import { ConsentService } from './consent.service';
import { ConsentController } from './consent.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [ConsentController],
  providers: [ConsentService],
  imports:[NatsModule]
})
export class ConsentModule {}
