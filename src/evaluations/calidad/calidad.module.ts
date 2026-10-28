import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalidadService } from './calidad.service';
import { CalidadController } from './calidad.controller';
import { CalidadEvaluation } from './entities/calidad-evaluation.entity';
import {RendimientosModule} from '../rendimiento/rendimiento.module'

@Module({
  imports: [TypeOrmModule.forFeature([CalidadEvaluation]),RendimientosModule], // 👈 Registra la entidad aquí
  controllers: [CalidadController],
  providers: [CalidadService],
})
export class CalidadModule {}
