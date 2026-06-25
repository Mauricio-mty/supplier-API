import { Controller, Post, Body, UseGuards, Req, Get, Param, Put, ParseUUIDPipe } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { CreateComprasDto } from './dto/create-compras.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth-guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/enums/role.enum';
import { UpdateComprasDto } from './dto/update-compras.dto';

@Controller('compras-evaluations')
@UseGuards(JwtAuthGuard, RolesGuard) // 🔒 Ruta protegida global
export class ComprasController {

  constructor(private readonly comprasService: ComprasService) {}

  // 📝 Registrar cierre y evaluación comercial
    @Post()
  @Roles(UserRole.USUARIO)
  async create(@Body() createComprasDto: CreateComprasDto, @Req() req) {

    const usuarioNombre = req.user.nombre; // Extraído de forma segura desde tu JWT
    return this.comprasService.create(createComprasDto, usuarioNombre);
  }

  // 🔍 Obtener el listado de control general para Compras
    @Get()
  @Roles(UserRole.USUARIO)
  async findAll() {

    return this.comprasService.findAll();
  }

  // 🔍 Obtener el detalle de un ítem en específico
    @Get('item/:orderItemId')
  @Roles(UserRole.USUARIO)
  async findOne(@Param('orderItemId', ParseUUIDPipe) orderItemId: string) {

    return this.comprasService.findOneByOrderItem(orderItemId);
  }

    @Put(':id')
  @Roles(UserRole.USUARIO)
  async update(

    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateComprasDto: UpdateComprasDto,
    @Req() req
  ) {
    const usuarioNombre = req.user.nombre;
    return this.comprasService.update(id, updateComprasDto, usuarioNombre);
  }

    @Get('pure-list')
  @Roles(UserRole.USUARIO)
  async findPureList(){

    return this.comprasService.findTableRecords();
  }
}