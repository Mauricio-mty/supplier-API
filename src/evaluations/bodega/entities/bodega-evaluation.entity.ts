import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { numericTransformer } from '../../../common/transformers/numeric.transformer';

/**
 * Estados posibles de una inspección de bodega.
 *
 * `Pendiente` representa una inspección parcial: el usuario abrió el formulario,
 * cargó lo que pudo y decidió no cerrarla todavía. Convive con `revisado: false`.
 */
export enum EstadoCompletitud {
  PENDIENTE = 'Pendiente',
  COMPLETO = 'Completo',
  INCOMPLETO = 'Incompleto',
  EXCEDENTE = 'Excedente',
}

@Entity('bodega_evaluations', { schema: 'public' })
export class BodegaEvaluation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid') // 💡 Mapeado simplemente como un campo string/UUID
  purchase_order_item_id!: string;

  @Column({ default: false })
  limpieza!: boolean;

  @Column({ default: false })
  equipo_proteccion!: boolean;

  @Column({ default: false })
  identificacion_producto_ok!: boolean;

  @Column({ default: false })
  libre_plagas!: boolean;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  cantidad_recibida!: number;

  @Column({ length: 50 })
  estado_completitud!: EstadoCompletitud;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    nullable: true,
  })
  fecha_ingreso!: Date;

  @Column({ default: false })
  tiene_fecha_vencimiento!: boolean;

  @Column({ default: false })
  embalaje_ok!: boolean;

  @Column({ default: false })
  revisado!: boolean;

  @Column({ default: false })
  ingreso_aprobado!: boolean;

  @Column({ length: 255, nullable: true })
  evaluado_por?: string;

  @Column('text', { nullable: true })
  comentarios?: string;
}
