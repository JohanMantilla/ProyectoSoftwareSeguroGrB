import { Module } from '@nestjs/common';
import { PersonalDataService } from './personal-data.service';
import { PersonalDataController } from './personal-data.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [PersonalDataController],
  providers: [PersonalDataService],
  imports:[NatsModule]
})
export class PersonalDataModule {}
