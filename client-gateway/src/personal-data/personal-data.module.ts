import { Module } from '@nestjs/common';
import { PersonalDataController } from './personal-data.controller';
import { NatsModule } from 'src/transports/nats.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [PersonalDataController],
  imports: [NatsModule, AuthModule]
})
export class PersonalDataModule {}
