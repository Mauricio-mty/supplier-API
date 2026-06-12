import { Controller, Post, Body, UseGuards, Req, Get, Param,Put, ParseUUIDPipe } from '@nestjs/common';
import { CalidadService } from './calidad.service';
import { CreateCalidadDto } from './dto/create-calidad.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth-guard';
// Nota: este controller requiere JWT para acceder a endpoints de evaluación.
import {UpdateCalidadDto} from './dto/update-calidad.dto'


@Controller('calidad-evaluations')
@UseGuards(JwtAuthGuard) // 🔒 Ruta protegida
export class CalidadController {
  constructor(private readonly calidadService: CalidadService) {}

  // 📝 Enviar evaluación de calidad
  @Post()
  async create(@Body() createCalidadDto: CreateCalidadDto, @Req() req) {
    const usuarioNombre = req.user.nombre; // Extraído de forma segura desde el JWT decodificado
    return this.calidadService.create(createCalidadDto, usuarioNombre);
  }

  // 🔍 Obtener el listado de todos los registros para el panel principal
  @Get()
  async findAll() {
    return this.calidadService.findAll();
  }

  // 🔍 Obtener los datos específicos de un ítem
  @Get('item/:orderItemId')
  async findOne(@Param('orderItemId', ParseUUIDPipe) orderItemId: string) {
    return this.calidadService.findOneByOrderItem(orderItemId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCalidadDto: UpdateCalidadDto,
    @Req() req
  ) {
    const usuarioNombre = req.user.nombre;
    return this.calidadService.update(id, updateCalidadDto, usuarioNombre);
  }
  
  @Get('pure-list')
  async findPureList(){
    return this.calidadService.findTableRecord();
  }
}