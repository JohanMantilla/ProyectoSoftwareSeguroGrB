import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PersonalDataModule } from './personal-data/personal-data.module';
import { AuditModule } from './audit/audit.module';
import { TransparencyModule } from './transparency/transparency.module';
import { ConsentModule } from './consent/consent.module';


@Module({
  imports: [AuthModule, UserModule, AuditModule, PersonalDataModule, TransparencyModule, ConsentModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
