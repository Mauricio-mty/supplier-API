import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('rendimientos', { schema: 'public' })
export class Rendimiento {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  purchase_order_item_id!: string;

  @Column('uuid')
  proveedor_id!: string;

  @Column({ type: 'integer', default: 0 })
  bodega_performance!: number;

  @Column({ type: 'integer', default: 0 })
  calidad_performance!: number;

  @Column({ type: 'integer', default: 0 })
  compras_performance!: number;

  @Column({ type: 'integer', default: 0 })
  total_performance!: number;

  @CreateDateColumn({ type: 'date' })
  date_performance!: Date;
}