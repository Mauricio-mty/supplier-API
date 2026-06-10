import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RendimientosService } from './rendimiento.service';
import { RendimientosController } from './rendimiento.controller';
import { Rendimiento } from './entities/rendimiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rendimiento])],
  controllers: [RendimientosController],
  providers: [RendimientosService],
})
export class RendimientosModule {}
