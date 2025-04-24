import { Module } from '@nestjs/common';
import { ConsentModule } from './consent/consent.module';


@Module({
  imports: [ConsentModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
