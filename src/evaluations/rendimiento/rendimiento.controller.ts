import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
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
  async create(
    @Body() createRendimientoDto: CreateRendimientoDTo,
  ): Promise<Rendimiento> {
    return this.rendimientosService.create(createRendimientoDto);
  }

  @Get()
  async getAll(
    @Query('proveedor_id') proveedor_id?: string,
    @Query('fecha_inicio') fecha_inicio?: string,
    @Query('fecha_fin') fecha_fin?: string,
  ) {
    return this.rendimientosService.getAll({
      proveedor_id,
      fecha_inicio,
      fecha_fin,
    });
  }

  @Get('data')
  async getData(
    @Query('proveedor_id') proveedor_id?: string,
    @Query('fecha_inicio') fecha_inicio?: string,
    @Query('fecha_fin') fecha_fin?: string,
  ) {
    return this.rendimientosService.getAll({
      proveedor_id,
      fecha_inicio,
      fecha_fin,
    });
  }

  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string): Promise<Rendimiento> {
    return this.rendimientosService.getById(id);
  }
}
