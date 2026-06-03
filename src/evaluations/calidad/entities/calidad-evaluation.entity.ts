import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('calidad_evaluations', { schema: 'public' })
export class CalidadEvaluation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid') // 💡 Guardado directamente como dato plano sin relación explícita
  purchase_order_item_id!: string;

  @Column({ default: false })
  cumple_calidad!: boolean;

  @Column({ default: false })
  cumple_norma!: boolean;

  @Column('text')
  accion_tomada!: string;

  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_evaluacion!: Date;

  @Column({ default: false })
  revisado!: boolean;

  @Column({ length: 255, nullable: true })
  evaluado_por?: string;

  @Column('text', { nullable: true })
  comentarios?: string;
}