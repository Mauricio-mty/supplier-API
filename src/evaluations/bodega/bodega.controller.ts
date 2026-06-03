// src/evaluations/bodega/bodega.controller.ts
import { Controller, Post, Body, UseGuards, Req, Get, Param,Put, ParseUUIDPipe } from '@nestjs/common';
import { BodegaService } from './bodega.service';
import { CreateBodegaDto } from './dto/create-bodega.dto'; // 👈 Importamos el DTO
import { JwtAuthGuard } from '../../auth/guards/jwt-auth-guard';
import { UpdateBodegaDto } from './dto/update-bodega.dto';

@Controller('bodega-evaluations')
@UseGuards(JwtAuthGuard)
export class BodegaController {
  constructor(private readonly bodegaService: BodegaService) {}

  // 🚚 Carga de datos (Creación de evaluación)
  @Post()
  async create(@Body() createBodegaDto: CreateBodegaDto, @Req() req) {
    // req.user.nombre se obtiene del JWT de forma segura
    const usuarioNombre = req.user.nombre; 
    return this.bodegaService.create(createBodegaDto, usuarioNombre);
  }

  @Get()
  async findAll() {
    return this.bodegaService.findAllOrdersAndEvaluations();
  }

  // 🔍 Consulta de datos
  @Get('item/:orderItemId')
  async findOne(@Param('orderItemId', ParseUUIDPipe) orderItemId: string) {
    return this.bodegaService.findOneByOrderItem(orderItemId);
  }


  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBodegaDto: UpdateBodegaDto,
    @Req() req
  ) {
    const usuarioNombre = req.user.nombre;
    return this.bodegaService.update(id, updateBodegaDto, usuarioNombre);
  }

  @Get('pure-list')
  async findPureList(){
    return this.bodegaService.findTableRecords();
  }
}