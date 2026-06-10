import { IsUUID, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateRendimientoDTo {
  @IsUUID()
  @IsNotEmpty()
  purchase_order_item_id!: string;

  @IsUUID()
  @IsNotEmpty()
  proveedor_id!: string;

  @IsNumber()
  @IsNotEmpty()
  bodega_performance!: number;

  @IsNumber()
  @IsNotEmpty()
  calidad_performance!: number;

  @IsNumber()
  @IsNotEmpty()
  compras_performance!: number;

  @IsNumber()
  @IsNotEmpty()
  total_performance!: number;
}