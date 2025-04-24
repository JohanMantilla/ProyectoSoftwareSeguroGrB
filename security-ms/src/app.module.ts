import { Module } from '@nestjs/common';
import { SecurityModule } from './security/security.module';


@Module({
  imports: [SecurityModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
