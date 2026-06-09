import { Module } from '@nestjs/common';
import { CalculosService } from './calculos.service';
import { CalculosController } from './calculos.controller';

@Module({
  controllers: [CalculosController],
  providers: [CalculosService],
})
export class CalculosModule {}
