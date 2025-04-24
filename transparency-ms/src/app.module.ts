import { Module } from '@nestjs/common';
import { TransparencyModule } from './transparency/transparency.module';


@Module({
  imports: [TransparencyModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
