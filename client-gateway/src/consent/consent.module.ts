import { Module } from '@nestjs/common';
import { ConsentController } from './consent.controller';
import { NatsModule } from 'src/transports/nats.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ConsentController],
  imports: [NatsModule, AuthModule],
})
export class ConsentModule {}
