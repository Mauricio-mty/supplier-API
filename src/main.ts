// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.enableCors();
  // 💡 Habilitar la validación automática de los DTOs globalmente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remueve campos del body que no estén definidos en el DTO
      forbidNonWhitelisted: true, // Lanza un error si envían campos no permitidos
      transform: true, // Transforma los tipos automáticamente si es necesario
    }),
  );

  await app.listen(3000);
}
bootstrap();