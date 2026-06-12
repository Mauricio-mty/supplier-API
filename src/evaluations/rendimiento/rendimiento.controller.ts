import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { RendimientosService } from './rendimiento.service';
import { CreateRendimientoDTo } from './dto/create-rendimiento.dto';
import { Rendimiento } from './entities/rendimiento.entity';

@Controller('rendimientos')
export class RendimientosController {
  constructor(private readonly rendimientosService: RendimientosService) {}

  /**
   * Crea un registro de rendimiento manualmente.
   *
   * Nota: el flujo principal suele ser automático desde Compras cuando
   * `producto_finalizado` es `true` (ver `ComprasService`).
   */
  @Post('create')
  async create(@Body() createRendimientoDto: CreateRendimientoDTo): Promise<Rendimiento> {
    return this.rendimientosService.create(createRendimientoDto);
  }


  @Get()
  async getAll(): Promise<Rendimiento[]> {
    return this.rendimientosService.getAll();
  }
  
  @Get('data')
  async getData() {
    return this.rendimientosService.getData();
  }
  @Get(':id')
  async getById(@Param('id') id: string): Promise<Rendimiento> {
    return this.rendimientosService.getById(id);
  }
}
