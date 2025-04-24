import { Module } from '@nestjs/common';
import { PersonalDataModule } from './personal-data/personal-data.module';


@Module({
  imports: [PersonalDataModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
