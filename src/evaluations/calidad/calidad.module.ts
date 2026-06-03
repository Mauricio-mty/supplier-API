import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalidadService } from './calidad.service';
import { CalidadController } from './calidad.controller';
import { CalidadEvaluation } from './entities/calidad-evaluation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CalidadEvaluation])], // 👈 Registra la entidad aquí
  controllers: [CalidadController],
  providers: [CalidadService],
})
export class CalidadModule {}