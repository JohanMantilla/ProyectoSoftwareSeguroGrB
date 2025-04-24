import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { AuthModule } from 'src/auth/auth.module';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [UserController],
  imports: [NatsModule, AuthModule],
  providers: [],
})
export class UserModule {}
