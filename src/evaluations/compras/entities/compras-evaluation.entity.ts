import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum CumpleEntregaRango {
  RANGO_0_3 = '0-3',
  RANGO_4_6 = '4-6',
  RANGO_7_9 = '7-9',
  RANGO_10_12 = '10-12',
  RANGO_13_15 = '13-15',
  RANGO_MAS_15 = '15+'
}


export enum  NivelServicio{
  EXCELENTE='Excelente',
  REGULAR='Regular',
  MALO='Malo'
}

@Entity('compras_evaluations', { schema: 'public' })
export class ComprasEvaluation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  purchase_order_item_id!: string;

@Column({
    type: 'enum',
    enum: CumpleEntregaRango,
    default: null // Puedes cambiar el default según tu lógica
  })
  cumple_entrega!: CumpleEntregaRango;


  @Column({
    type:'enum',
    enum:NivelServicio, 
    default: false 
  })
  cumple_servicio!: NivelServicio;

  @Column({ default: false })
  producto_finalizado!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_evaluacion!: Date;

  @Column({ length: 255, nullable: true })
  evaluado_por?: string;

  @Column('text', { nullable: true })
  comentarios?: string;
}