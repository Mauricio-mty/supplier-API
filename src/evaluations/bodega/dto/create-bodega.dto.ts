// src/evaluations/bodega/dto/create-bodega.dto.ts
import { IsUUID, IsBoolean, IsString, IsIn, IsOptional, IsNumber } from 'class-validator';

export class CreateBodegaDto {
  @IsUUID('4', { message: 'El purchase_order_item_id debe ser un UUID versión 4 válido' })
  purchase_order_item_id!: string;

  @IsBoolean({ message: 'El campo limpieza debe ser un valor booleano' })
  limpieza!: boolean;

  @IsBoolean({ message: 'El campo equipo_proteccion debe ser un valor booleano' })
  equipo_proteccion!: boolean;
  
  @IsNumber({}, { message: 'El campo cantidad_recibida debe ser un número' })
  cantidad_recibida!: number;

  @IsBoolean({ message: 'El campo identificacion_producto_ok debe ser un valor booleano' })
  identificacion_producto_ok!: boolean;

  @IsBoolean({ message: 'El campo libre_plagas debe ser un valor booleano' })
  libre_plagas!: boolean;

  @IsString({ message: 'El estado de completitud debe ser un texto' })
  @IsIn(['Completo', 'Incompleto', 'Excedente'], {
    message: 'El estado de completitud debe ser estrictamente: Completo, Incompleto o Excedente',
  })
  estado_completitud!: 'Completo' | 'Incompleto' | 'Excedente';

  @IsBoolean({ message: 'El campo tiene_fecha_vencimiento debe ser un valor booleano' })
  tiene_fecha_vencimiento!: boolean;

  @IsBoolean({ message: 'El campo embalaje_ok debe ser un valor booleano' })
  embalaje_ok!: boolean;

  @IsBoolean({ message: 'El campo revisado debe ser un valor booleano' })
  revisado!: boolean;

  @IsBoolean({ message: 'El campo ingreso_aprobado debe ser un valor booleano' })
  ingreso_aprobado!: boolean;

  @IsString({ message: 'Los comentarios deben ser una cadena de texto' })
  @IsOptional() // 💡 Este campo acepta null o vacío en tu BD, por eso es opcional
  comentarios?: string;
}