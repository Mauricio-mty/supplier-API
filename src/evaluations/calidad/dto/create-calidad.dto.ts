import { IsUUID, IsBoolean, IsString, IsNotEmpty, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCalidadDto {
  @IsUUID('4', { message: 'El purchase_order_item_id debe ser un UUID versión 4 válido' })
  purchase_order_item_id!: string;

  @IsBoolean({ message: 'El campo cumple_calidad debe ser un valor booleano' })
  cumple_calidad!: boolean;

  @IsDate({ message: 'La fecha de evaluación debe ser una fecha válida' })
  @Type(() => Date)
  fecha_evaluacion!: Date;

  @IsBoolean({ message: 'El campo cumple_norma debe ser un valor booleano' })
  cumple_norma!: boolean;

  @IsString({ message: 'La acción tomada debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La acción tomada no puede estar vacía' })
  accion_tomada!: string;

  @IsBoolean({ message: 'El campo revisado debe ser un valor booleano' })
  revisado!: boolean;

  @IsString({ message: 'Los comentarios deben ser un texto' })
  @IsOptional()
  comentarios?: string;
}