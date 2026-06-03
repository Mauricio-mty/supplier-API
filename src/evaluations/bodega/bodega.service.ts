import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; // 💡 Importamos DataSource
import { BodegaEvaluation } from './entities/bodega-evaluation.entity';
import { CreateBodegaDto } from './dto/create-bodega.dto';
import { UpdateBodegaDto } from './dto/update-bodega.dto';

@Injectable()
export class BodegaService {
  constructor(
    @InjectRepository(BodegaEvaluation)
    private readonly bodegaRepository: Repository<BodegaEvaluation>,
    private readonly dataSource: DataSource, // 💡 Inyectamos el DataSource global
  ) {}

  // 📝 MÉTODO DE CARGA (El que ya teníamos)
  async create(createBodegaDto: CreateBodegaDto, usuarioNombre: string): Promise<BodegaEvaluation> {
    const nuevaEvaluacion = this.bodegaRepository.create({
      ...createBodegaDto,
      evaluado_por: usuarioNombre,
    });
    return await this.bodegaRepository.save(nuevaEvaluacion);
  }

  async findAllOrdersAndEvaluations() {
    const query = `
      SELECT 
      ev.id AS bodega_evaluation_id,
          p.numero_orden_compra,
          p.fecha_entrega_prevista,
          pro.codigo AS codigo_producto,
          pro.nombre AS nombre_producto,
          su.nombre AS nombre_proveedor,
          po.id AS order_item_id,
          po.cantidad,
          ev.fecha_ingreso,
          ev.limpieza,
          ev.equipo_proteccion,
          ev.identificacion_producto_ok,
          ev.libre_plagas,
          ev.estado_completitud,
          ev.tiene_fecha_vencimiento,
          ev.embalaje_ok,
          ev.ingreso_aprobado,
          ev.revisado
      FROM public.purchase_orders AS p
      INNER JOIN public.purchase_order_items AS po ON p.id = po.purchase_order_id
      INNER JOIN public.suppliers AS su ON p.supplier_id = su.id
      INNER JOIN public.products AS pro ON po.product_id = pro.id
      LEFT JOIN public.bodega_evaluations AS ev ON po.id = ev.purchase_order_item_id; -- 💡 Quitamos el WHERE po.id = :order_item_id
    `;

    // Ejecuta la consulta nativa masiva
    const resultado = await this.dataSource.query(query);

    // Retorna la lista completa (si está vacía, devolverá un arreglo [])
    return resultado;
  }

  // 🔍 MÉTODO DE CONSULTA CON TU SQL NATIVO
  async findOneByOrderItem(orderItemId: string) {
    const query = `
      SELECT 
          p.numero_orden_compra,
          p.fecha_entrega_prevista,
          pro.codigo AS codigo_producto,
          pro.nombre AS nombre_producto,
          su.nombre AS nombre_proveedor,
          po.id AS order_item_id,
          po.cantidad,
          ev.fecha_ingreso,
          ev.limpieza,
          ev.equipo_proteccion,
          ev.identificacion_producto_ok,
          ev.libre_plagas,
          ev.estado_completitud,
          ev.tiene_fecha_vencimiento,
          ev.embalaje_ok,
          ev.ingreso_aprobado,
          ev.revisado
      FROM public.purchase_orders AS p
      INNER JOIN public.purchase_order_items AS po ON p.id = po.purchase_order_id
      INNER JOIN public.suppliers AS su ON p.supplier_id = su.id
      INNER JOIN public.products AS pro ON po.product_id = pro.id
      LEFT JOIN public.bodega_evaluations AS ev ON po.id = ev.purchase_order_item_id
      WHERE po.id = $1; -- 💡 Usamos $1 como parámetro seguro en PostgreSQL
    `;

    // Ejecutamos el query pasando el UUID en el arreglo de parámetros
    const resultado = await this.dataSource.query(query, [orderItemId]);

    // Si el query no retorna ninguna fila, significa que el order_item_id no existe en el sistema
    if (!resultado || resultado.length === 0) {
      throw new NotFoundException(`No se encontró ningún ítem de orden de compra con el ID: ${orderItemId}`);
    }

    // Retornamos el primer (y único) resultado encontrado
    return resultado[0];
  }


  async update(id: string, updateBodegaDto: UpdateBodegaDto, usuarioNombre: string): Promise<BodegaEvaluation> {
    // 1. Buscamos si la evaluación existe
    const evaluacion = await this.bodegaRepository.findOne({ where: { id } });
    if (!evaluacion) {
      throw new NotFoundException(`La evaluación de bodega con ID ${id} no existe.`);
    }

    // 2. Fusionamos los cambios y actualizamos quién editó por última vez
    const evaluacionEditada = this.bodegaRepository.merge(evaluacion, {
      ...updateBodegaDto,
      evaluado_por: usuarioNombre, // Queda registrado quién hizo la última modificación
    });

    // 3. Guardamos en la base de datos
    return await this.bodegaRepository.save(evaluacionEditada);
  }


  async findTableRecords(): Promise<BodegaEvaluation[]> {
  return await this.bodegaRepository.find({
    order: { fecha_ingreso: 'DESC' } // Ordenado desde la más reciente
  });
}

}