import { Controller, Post, Body, UseGuards, Req, Get, Param, Put, ParseUUIDPipe } from '@nestjs/common';
import { BodegaService } from './bodega.service';
import { CreateBodegaDto } from './dto/create-bodega.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth-guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/enums/role.enum';
import { UpdateBodegaDto } from './dto/update-bodega.dto';

@Controller('bodega-evaluations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BodegaController {

  constructor(private readonly bodegaService: BodegaService) {}

  // 🚚 Carga de datos (Creación de evaluación)
    @Post()
  @Roles(UserRole.EMPLEADO)
  async create(@Body() createBodegaDto: CreateBodegaDto, @Req() req) {

    // req.user.nombre se obtiene del JWT de forma segura
    const usuarioNombre = req.user.nombre; 
    return this.bodegaService.create(createBodegaDto, usuarioNombre);
  }

    @Get()
  @Roles(UserRole.EMPLEADO, UserRole.USUARIO)
  async findAll() {

    return this.bodegaService.findAllOrdersAndEvaluations();
  }

  // 🔍 Consulta de datos
    @Get('item/:orderItemId')
  @Roles(UserRole.EMPLEADO, UserRole.USUARIO)
  async findOne(@Param('orderItemId', ParseUUIDPipe) orderItemId: string) {

    return this.bodegaService.findOneByOrderItem(orderItemId);
  }


    @Put(':id')
  @Roles(UserRole.EMPLEADO)
  async update(

    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBodegaDto: UpdateBodegaDto,
    @Req() req
  ) {
    const usuarioNombre = req.user.nombre;
    return this.bodegaService.update(id, updateBodegaDto, usuarioNombre);
  }

    @Get('pure-list')
  @Roles(UserRole.EMPLEADO, UserRole.USUARIO)
  async findPureList(){

    return this.bodegaService.findTableRecords();
  }
}