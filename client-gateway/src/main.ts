import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config/envs.config';
import { RpcCustomExceptionFilter } from './common/expections/rpc-custom-exception.expection';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import rateLimit from 'express-rate-limit'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Habilitar CORS para permitir que el frontend acceda a los microservicios
  app.enableCors({
    origin: '*',  // ⚠️ En producción usa ['https://tu-dominio.com']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );

  app.useGlobalFilters(new RpcCustomExceptionFilter());

  app.setGlobalPrefix('api');
  app.use(cookieParser());

  // 📌 **Rate Limiting Configuración Global**
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 4, // Máximo 4 intentos por IP
    message: 'Demasiadas solicitudes. Inténtalo de nuevo en un minuto.',
    headers: true, // Incluir cabeceras `Retry-After`
  });

  // ✅ Aplicar Rate Limiting en los endpoints más críticos
  app.use('/api/auth/login', limiter);
  app.use('/api/auth/register', limiter);
  app.use('/api/auth/forgot-password', limiter);
  app.use('/api/auth/reset-password', limiter);
  app.use('/api/auth/change-password', limiter);
  app.use('/api/auth/refresh', limiter);

  await app.listen(envs.PORT);
}
bootstrap();
