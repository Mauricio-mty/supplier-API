import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CalidadEvaluation } from './entities/calidad-evaluation.entity';
import { CreateCalidadDto } from './dto/create-calidad.dto';
 import { UpdateCalidadDto } from './dto/update-calidad.dto';

@Injectable()
export class CalidadService {
  constructor(
    @InjectRepository(CalidadEvaluation)
    private readonly calidadRepository: Repository<CalidadEvaluation>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 💾 CARGA DE DATOS: guardar dictamen de calidad.
   *
   * Persiste la evaluación en `calidad_evaluations` y registra `evaluado_por`.
   */

  async create(createCalidadDto: CreateCalidadDto, usuarioNombre: string): Promise<CalidadEvaluation> {
    const nuevaEvaluacion = this.calidadRepository.create({
      ...createCalidadDto,
      evaluado_por: usuarioNombre, // 💡 Inyectado automáticamente desde el JWT
    });
    return await this.calidadRepository.save(nuevaEvaluacion);
  }

  // 🔍 CONSULTA GENERAL: Listar todo el historial para el panel de Calidad
  async findAll() {
    const query = `
      SELECT 
      cal.id AS calidad_evaluation_id,
          p.numero_orden_compra,
          p.fecha_entrega_prevista,
          pro.codigo AS codigo_producto,
          pro.nombre AS nombre_producto,
          su.nombre AS nombre_proveedor,
          po.id AS order_item_id,
          po.cantidad,
          ev.estado_completitud AS bodega_completitud,
          ev.ingreso_aprobado AS bodega_ingreso_aprobado,
          cal.cumple_calidad,
          cal.cumple_norma,
          cal.accion_tomada,
          cal.fecha_evaluacion,
          cal.revisado AS calidad_revisado
      FROM public.purchase_orders AS p
      INNER JOIN public.purchase_order_items AS po ON p.id = po.purchase_order_id
      INNER JOIN public.suppliers AS su ON p.supplier_id = su.id
      INNER JOIN public.products AS pro ON po.product_id = pro.id
      right JOIN public.bodega_evaluations AS ev ON po.id = ev.purchase_order_item_id
      right JOIN public.calidad_evaluations AS cal ON po.id = cal.purchase_order_item_id;
    `;
    return await this.dataSource.query(query);
  }

  // 🔍 CONSULTA INDIVIDUAL: Buscar los detalles de un solo ítem seleccionado
  async findOneByOrderItem(orderItemId: string) {
    const query = `
     
      select
      ev.id as calidad_evaluation_id,
      p.numero_orden_compra,
      p.fecha_entrega_prevista,
      pro.codigo as codigo_producto,
      pro.nombre as nombre_producto,
      po.id as order_item_id,
      po.cantidad,
      ev.fecha_evaluacion,
      ev.cumple_calidad,
      ev.cumple_norma,
      ev.accion_tomada,
      ev.revisado,
      ev.evaluado_por,
      ev.comentarios
      from public.purchase_orders as p
      Inner join public.purchase_order_items as po ON p.id=po.purchase_order_id
      Inner join  public.suppliers as su on p.supplier_id=su.id
      inner join public.products as pro on po.product_id=pro.id
      RIGHT JOIN public.calidad_evaluations as ev on po.id=ev.purchase_order_item_id
      WHERE ev.id = $1;
    `;
    const resultado = await this.dataSource.query(query, [orderItemId]);

    if (!resultado || resultado.length === 0) {
      throw new NotFoundException(`No se encontró ningún ítem de orden con el ID: ${orderItemId}`);
    }
    return resultado[0];
  }


  async update(id: string, updateCalidadDto: UpdateCalidadDto, usuarioNombre: string): Promise<CalidadEvaluation> {
    const evaluacion = await this.calidadRepository.findOne({ where: { id } });
    if (!evaluacion) {
      throw new NotFoundException(`La evaluación de calidad con ID ${id} no existe.`);
    }

    const evaluacionEditada = this.calidadRepository.merge(evaluacion, {
      ...updateCalidadDto,
      evaluado_por: usuarioNombre,
    });

    return await this.calidadRepository.save(evaluacionEditada);
  }

async findTableRecord():Promise<CalidadEvaluation[]>{
  return await this.calidadRepository.find({
    order:{fecha_evaluacion:'DESC'}
  });
}

}