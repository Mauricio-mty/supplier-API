import { Controller, Post, Body, UseGuards, Req, Get, Param, Put, ParseUUIDPipe, Delete } from '@nestjs/common';
import { CalidadService } from './calidad.service';
import { CreateCalidadDto } from './dto/create-calidad.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth-guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/enums/role.enum';
import { UpdateCalidadDto } from './dto/update-calidad.dto';

@Controller('calidad-evaluations')
@UseGuards(JwtAuthGuard, RolesGuard) // 🔒 Ruta protegida con JWT y Roles
export class CalidadController {

  constructor(private readonly calidadService: CalidadService) {}

  // 📝 Enviar evaluación de calidad
    @Post()
  @Roles(UserRole.ADMIN_CALIDAD)
  async create(@Body() createCalidadDto: CreateCalidadDto, @Req() req) {

    const usuarioNombre = req.user.nombre; // Extraído de forma segura desde el JWT decodificado
    return this.calidadService.create(createCalidadDto, usuarioNombre);
  }

  // 🔍 Obtener el listado de todos los registros para el panel principal
    @Get()
  @Roles(UserRole.ADMIN_CALIDAD, UserRole.USUARIO)
  async findAll() {

    return this.calidadService.findAll();
  }

  // 🔍 Obtener los datos específicos de un ítem
    @Get('item/:orderItemId')
  @Roles(UserRole.ADMIN_CALIDAD, UserRole.USUARIO)
  async findOne(@Param('orderItemId', ParseUUIDPipe) orderItemId: string) {

    return this.calidadService.findOneByOrderItem(orderItemId);
  }

    @Put(':id')
  @Roles(UserRole.ADMIN_CALIDAD)
  async update(

    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCalidadDto: UpdateCalidadDto,
    @Req() req
  ) {
    const usuarioNombre = req.user.nombre;
    return this.calidadService.update(id, updateCalidadDto, usuarioNombre);
  }
  
    @Get('pure-list')
  @Roles(UserRole.ADMIN_CALIDAD, UserRole.USUARIO)
  async findPureList(){

    return this.calidadService.findTableRecord();
  }
}