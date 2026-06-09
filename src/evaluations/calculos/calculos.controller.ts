import { Controller } from '@nestjs/common';
import { CalculosService } from './calculos.service';

@Controller('calculos')
export class CalculosController {
  constructor(private readonly calculosService: CalculosService) {}
}
