import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports:[NatsModule]
})
export class UserModule {}
