import {
  IsUUID,
  IsBoolean,
  IsString,
  IsOptional,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CumpleEntregaRango,
  NivelServicio,
} from '../entities/compras-evaluation.entity';

export class CreateComprasDto {
  @IsUUID('4', {
    message: 'El purchase_order_item_id debe ser un UUID versión 4 válido',
  })
  purchase_order_item_id!: string;

  @IsEnum(CumpleEntregaRango, {
    message: `El campo cumple_entrega debe ser un rango válido. Valores permitidos: ${Object.values(CumpleEntregaRango).join(', ')}`,
  })
  cumple_entrega!: CumpleEntregaRango;

  @IsEnum(NivelServicio, {
    message: `El campo cumple_servicio debe ser un nivel de servicio válido. Valores permitidos: ${Object.values(NivelServicio).join(', ')}`,
  })
  cumple_servicio!: NivelServicio;

  @IsBoolean({
    message: 'El campo producto_finalizado debe ser un valor booleano',
  })
  producto_finalizado!: boolean; // 💡 El interruptor que cierra el flujo completo

  @IsOptional()
  @IsDate({ message: 'La fecha de evaluación debe ser una fecha válida' })
  @Type(() => Date)
  fecha_evaluacion?: Date;

  @IsString({ message: 'Los comentarios deben ser una cadena de texto' })
  @IsOptional()
  comentarios?: string;
}
