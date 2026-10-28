// src/evaluations/bodega/bodega.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BodegaService } from './bodega.service';
import { BodegaController } from './bodega.controller';
import { BodegaEvaluation } from './entities/bodega-evaluation.entity';
import { RendimientosService } from '../rendimiento/rendimiento.service'; // 💡 Importamos el servicio de rendimiento para usarlo en la creación de evaluaciones
import { RendimientosModule } from '../rendimiento/rendimiento.module';

@Module({
  imports: [TypeOrmModule.forFeature([BodegaEvaluation]),RendimientosModule], // 👈 Esto habilita el repositorio para inyectarlo en el servicio
  controllers: [BodegaController],
  providers: [BodegaService],
})
export class BodegaModule {}
