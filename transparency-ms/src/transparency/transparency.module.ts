import { Module } from '@nestjs/common';
import { TransparencyService } from './transparency.service';
import { TransparencyController } from './transparency.controller';
import { NatsModule } from 'src/transports/nats.module';


@Module({
  controllers: [TransparencyController],
  providers: [TransparencyService],
  imports: [NatsModule]
})
export class TransparencyModule {}


