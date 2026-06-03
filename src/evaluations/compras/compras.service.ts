import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ComprasEvaluation } from './entities/compras-evaluation.entity';
import { CreateComprasDto } from './dto/create-compras.dto';
import {UpdateComprasDto} from './dto/update-compras.dto';


@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(ComprasEvaluation)
    private readonly comprasRepository: Repository<ComprasEvaluation>,
    private readonly dataSource: DataSource,
  ) {}

  // 💾 CARGA DE DATOS: Cierre definitivo del ciclo comercial
  async create(createComprasDto: CreateComprasDto, usuarioNombre: string): Promise<ComprasEvaluation> {
    const nuevaEvaluacion = this.comprasRepository.create({
      ...createComprasDto,
      evaluado_por: usuarioNombre, // 💡 Inyectado dinámicamente desde el JWT
    });
    return await this.comprasRepository.save(nuevaEvaluacion);
  }

  // 🔍 CONSULTA GENERAL: Historial completo para el panel de Compras
  async findAll() {
    const query = `
      SELECT 
      com.id AS compras_evaluation_id,
          p.numero_orden_compra,
          p.fecha_entrega_prevista,
          pro.codigo AS codigo_producto,
          pro.nombre AS nombre_producto,
          su.nombre AS nombre_proveedor,
          po.id AS order_item_id,
          po.cantidad,
          ev.revisado AS bodega_revisado,
          ev.ingreso_aprobado AS bodega_aprobado,
          cal.revisado AS calidad_revisado,
          cal.cumple_calidad AS calidad_aprobado,
          com.cumple_entrega,
          com.cumple_servicio,
          com.producto_finalizado,
          com.fecha_evaluacion
      FROM public.purchase_orders AS p
      INNER JOIN public.purchase_order_items AS po ON p.id = po.purchase_order_id
      INNER JOIN public.suppliers AS su ON p.supplier_id = su.id
      INNER JOIN public.products AS pro ON po.product_id = pro.id
      LEFT JOIN public.bodega_evaluations AS ev ON po.id = ev.purchase_order_item_id
      LEFT JOIN public.calidad_evaluations AS cal ON po.id = cal.purchase_order_item_id
      LEFT JOIN public.compras_evaluations AS com ON po.id = com.purchase_order_item_id;
    `;
    return await this.dataSource.query(query);
  }

  // 🔍 CONSULTA INDIVIDUAL: Datos de un ítem específico para abrir el formulario
  async findOneByOrderItem(orderItemId: string) {
    const query = `
      SELECT 
      com.id AS compras_evaluation_id,
          p.numero_orden_compra,
          p.fecha_entrega_prevista,
          pro.codigo AS codigo_producto,
          pro.nombre AS nombre_producto,
          su.nombre AS nombre_proveedor,
          po.id AS order_item_id,
          po.cantidad,
          ev.revisado AS bodega_revisado,
          ev.ingreso_aprobado AS bodega_aprobado,
          cal.revisado AS calidad_revisado,
          cal.cumple_calidad AS calidad_aprobado,
          com.cumple_entrega,
          com.cumple_servicio,
          com.producto_finalizado,
          com.fecha_evaluacion
      FROM public.purchase_orders AS p
      INNER JOIN public.purchase_order_items AS po ON p.id = po.purchase_order_id
      INNER JOIN public.suppliers AS su ON p.supplier_id = su.id
      INNER JOIN public.products AS pro ON po.product_id = pro.id
      LEFT JOIN public.bodega_evaluations AS ev ON po.id = ev.purchase_order_item_id
      LEFT JOIN public.calidad_evaluations AS cal ON po.id = cal.purchase_order_item_id
      LEFT JOIN public.compras_evaluations AS com ON po.id = com.purchase_order_item_id
      WHERE po.id = $1;
    `;
    const resultado = await this.dataSource.query(query, [orderItemId]);

    if (!resultado || resultado.length === 0) {
      throw new NotFoundException(`No se encontró ningún registro comercial con el ID: ${orderItemId}`);
    }
    return resultado[0];
  }


  async update(id: string, updateComprasDto: UpdateComprasDto, usuarioNombre: string): Promise<ComprasEvaluation> {
    const evaluacion = await this.comprasRepository.findOne({ where: { id } });
    if (!evaluacion) {
      throw new NotFoundException(`La evaluación de compras con ID ${id} no existe.`);
    }

    const evaluacionEditada = this.comprasRepository.merge(evaluacion, {
      ...updateComprasDto,
      evaluado_por: usuarioNombre,
    });

    return await this.comprasRepository.save(evaluacionEditada);
  }

  async findTableRecords(): Promise<ComprasEvaluation[]>{
    return await this.comprasRepository.find({
      order:{fecha_evaluacion:'DESC'}
    });
  }
}