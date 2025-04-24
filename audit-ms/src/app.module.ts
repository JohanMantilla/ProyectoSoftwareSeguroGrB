import { Module } from '@nestjs/common';
import { AuditModule } from './audit/audit.module';


@Module({
  imports: [AuditModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
