// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aktifkan global validation (class-validator di DTO)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,      // strip property yang tidak ada di DTO
      forbidNonWhitelisted: true,
      transform: true,      // auto-transform tipe data (string → number)
    }),
  );

  // CORS untuk Next.js frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH'],
  });

  await app.listen(process.env.PORT ?? 3001);
  console.log(`Server running on http://localhost:${process.env.PORT ?? 3001}`);
}
bootstrap();