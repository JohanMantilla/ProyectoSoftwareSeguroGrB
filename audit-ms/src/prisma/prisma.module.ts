import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService], // Se declara PrismaService como proveedor
  exports: [PrismaService],   // Se exporta para ser usado en otros módulos
})
export class PrismaModule {}
