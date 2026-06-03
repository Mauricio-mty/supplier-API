import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('compras_evaluations', { schema: 'public' })
export class ComprasEvaluation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  purchase_order_item_id!: string;

  @Column({ default: false })
  cumple_entrega!: boolean;

  @Column({ default: false })
  cumple_servicio!: boolean;

  @Column({ default: false })
  producto_finalizado!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_evaluacion!: Date;

  @Column({ length: 255, nullable: true })
  evaluado_por?: string;

  @Column('text', { nullable: true })
  comentarios?: string;
}