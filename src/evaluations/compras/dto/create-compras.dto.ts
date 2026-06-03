import { IsUUID, IsBoolean, IsString, IsOptional } from 'class-validator';

export class CreateComprasDto {
  @IsUUID('4', { message: 'El purchase_order_item_id debe ser un UUID versión 4 válido' })
  purchase_order_item_id!: string;

  @IsBoolean({ message: 'El campo cumple_entrega debe ser un valor booleano' })
  cumple_entrega!: boolean;

  @IsBoolean({ message: 'El campo cumple_servicio debe ser un valor booleano' })
  cumple_servicio!: boolean;

  @IsBoolean({ message: 'El campo producto_finalizado debe ser un valor booleano' })
  producto_finalizado!: boolean; // 💡 El interruptor que cierra el flujo completo

  @IsString({ message: 'Los comentarios deben ser una cadena de texto' })
  @IsOptional()
  comentarios?: string;
}