// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  const config = new DocumentBuilder()
    .setTitle('Restoran Kasir API - Official')
    .setDescription('Dokumentasi API Resmi untuk Sistem Manajemen Restoran')
    .setVersion('1.0')
    .addBearerAuth() // Mendukung pengujian token JWT di web
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // 👈 URL Dokumentasi

  await app.listen(process.env.PORT ?? 3001);
  console.log(`Server running on http://localhost:${process.env.PORT ?? 3001}`);
}
bootstrap();