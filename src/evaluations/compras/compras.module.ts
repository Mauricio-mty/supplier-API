import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComprasService } from './compras.service';
import { ComprasController } from './compras.controller';
import { ComprasEvaluation } from './entities/compras-evaluation.entity';
import { RendimientosModule } from '../rendimiento/rendimiento.module';

@Module({
  imports: [TypeOrmModule.forFeature([ComprasEvaluation]), RendimientosModule], // 👈 Registra la entidad aquí
  controllers: [ComprasController],
  providers: [ComprasService],
})
export class ComprasModule {}