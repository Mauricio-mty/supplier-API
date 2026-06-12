import { Controller, Post, Body, UseGuards, Req, Get, Param,Put, ParseUUIDPipe } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { CreateComprasDto } from './dto/create-compras.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth-guard';
// Nota: este controller requiere JWT para acceder a endpoints de evaluación.
import { UpdateComprasDto } from './dto/update-compras.dto';


@Controller('compras-evaluations')
@UseGuards(JwtAuthGuard) // 🔒 Ruta protegida global
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  // 📝 Registrar cierre y evaluación comercial
  @Post()
  async create(@Body() createComprasDto: CreateComprasDto, @Req() req) {
    const usuarioNombre = req.user.nombre; // Extraído de forma segura desde tu JWT
    return this.comprasService.create(createComprasDto, usuarioNombre);
  }

  // 🔍 Obtener el listado de control general para Compras
  @Get()
  async findAll() {
    return this.comprasService.findAll();
  }

  // 🔍 Obtener el detalle de un ítem en específico
  @Get('item/:orderItemId')
  async findOne(@Param('orderItemId', ParseUUIDPipe) orderItemId: string) {
    return this.comprasService.findOneByOrderItem(orderItemId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateComprasDto: UpdateComprasDto,
    @Req() req
  ) {
    const usuarioNombre = req.user.nombre;
    return this.comprasService.update(id, updateComprasDto, usuarioNombre);
  }

  @Get('pure-list')
  async findPureList(){
    return this.comprasService.findTableRecords();
  }
}