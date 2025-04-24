import { Module } from '@nestjs/common';
import { TransparencyController } from './transparency.controller';
import { NatsModule } from 'src/transports/nats.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [TransparencyController],
  imports: [NatsModule, AuthModule]
})
export class TransparencyModule {}