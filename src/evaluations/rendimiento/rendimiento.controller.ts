import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { RendimientosService } from './rendimiento.service';
import { CreateRendimientoDTo } from './dto/create-rendimiento.dto';
import { Rendimiento } from './entities/rendimiento.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth-guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/enums/role.enum';

@Controller('rendimientos')
@UseGuards(JwtAuthGuard, RolesGuard)
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
