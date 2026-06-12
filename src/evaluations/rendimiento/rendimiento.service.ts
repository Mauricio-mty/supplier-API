import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Rendimiento } from './entities/rendimiento.entity';
import { CreateRendimientoDTo } from './dto/create-rendimiento.dto';
import { CumpleEntregaRango, NivelServicio } from '../compras/entities/compras-evaluation.entity';

/**
 * Fuente en memoria con las evaluaciones necesarias para calcular el rendimiento.
 *
 * Si algún campo viene `null`, el servicio considera que no hay información suficiente
 * para generar/actualizar el rendimiento.
 */
type PerformanceSourceRow = {
  purchase_order_item_id: string;
  proveedor_id: string;
  limpieza: boolean | null;
  equipo_proteccion: boolean | null;
  identificacion_producto_ok: boolean | null;
  libre_plagas: boolean | null;
  embalaje_ok: boolean | null;
  estado_completitud: 'Completo' | 'Incompleto' | 'Excedente' | null;
  cumple_calidad: boolean | null;
  cumple_norma: boolean | null;
  cumple_entrega: CumpleEntregaRango | null;
  cumple_servicio: NivelServicio | null;
};

@Injectable()
export class RendimientosService {
  constructor(
    @InjectRepository(Rendimiento)
    private rendimientosRepository: Repository<Rendimiento>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crea un registro de rendimiento de forma manual.
   */
  async create(createRendimientoDto: CreateRendimientoDTo): Promise<Rendimiento> {
    const rendimiento = this.rendimientosRepository.create(createRendimientoDto);
    return this.rendimientosRepository.save(rendimiento);
  }

  /**
   * Genera (o actualiza) el rendimiento a partir de un `purchase_order_item_id`.
   *
   * Flujo:
   * 1) Trae las evaluaciones de bodega, calidad y compras.
   * 2) Calcula los sub-scores y el total.
   * 3) Upsert lógico: si existe, actualiza; si no existe, crea.
   */
  async createFromOrderItemId(purchaseOrderItemId: string): Promise<Rendimiento> {
    const performanceSource = await this.getPerformanceSource(purchaseOrderItemId);
    const rendimientoDto = this.buildRendimientoDto(performanceSource);

    const existingRendimiento = await this.rendimientosRepository.findOne({
      where: { purchase_order_item_id: purchaseOrderItemId },
    });

    if (existingRendimiento) {
      const rendimientoEditado = this.rendimientosRepository.merge(
        existingRendimiento,
        rendimientoDto,
      );
      return this.rendimientosRepository.save(rendimientoEditado);
    }

    return this.create(rendimientoDto);
  }

  /**
   * Lista todos los rendimientos almacenados.
   */
  async getAll(): Promise<Rendimiento[]> {
    return this.rendimientosRepository.find();
  }

  /**
   * Obtiene la “fuente” mínima requerida para calcular el rendimiento.
   *
   * Se usan LEFT JOIN porque podrían no existir algunas evaluaciones aún.
   * Si falta algún campo requerido, el método lanza `NotFoundException`.
   */
  private async getPerformanceSource(
    purchaseOrderItemId: string,
  ): Promise<PerformanceSourceRow> {
    const query = `
      SELECT
        poi.id AS purchase_order_item_id,
        po.supplier_id AS proveedor_id,
        bo.limpieza,
        bo.equipo_proteccion,
        bo.identificacion_producto_ok,
        bo.libre_plagas,
        bo.embalaje_ok,
        bo.estado_completitud,
        ca.cumple_calidad,
        ca.cumple_norma,
        co.cumple_entrega,
        co.cumple_servicio
      FROM public.purchase_order_items AS poi
      INNER JOIN public.purchase_orders AS po ON poi.purchase_order_id = po.id
      LEFT JOIN public.bodega_evaluations AS bo ON bo.purchase_order_item_id = poi.id
      LEFT JOIN public.calidad_evaluations AS ca ON ca.purchase_order_item_id = poi.id
      LEFT JOIN public.compras_evaluations AS co ON co.purchase_order_item_id = poi.id
      WHERE poi.id = $1
      LIMIT 1;
    `;

    const resultado = (await this.dataSource.query(query, [purchaseOrderItemId])) as
      | PerformanceSourceRow[]
      | undefined;

    if (!resultado || resultado.length === 0) {
      throw new NotFoundException(
        `No se encontró el ítem de orden de compra ${purchaseOrderItemId}`,
      );
    }

    const source = resultado[0];

    // Validación de suficiencia: si algún campo clave viene null, no hay evaluaciones completas.
    if (
      source.proveedor_id == null ||
      source.limpieza == null ||
      source.equipo_proteccion == null ||
      source.identificacion_producto_ok == null ||
      source.libre_plagas == null ||
      source.embalaje_ok == null ||
      source.estado_completitud == null ||
      source.cumple_calidad == null ||
      source.cumple_norma == null ||
      source.cumple_entrega == null ||
      source.cumple_servicio == null
    ) {
      throw new NotFoundException(
        `No se puede generar el rendimiento porque faltan evaluaciones para el ítem ${purchaseOrderItemId}`,
      );
    }

    return source;
  }

  /**
   * Construye el DTO de `Rendimiento` a partir del scoring base.
   */
  private buildRendimientoDto(
    source: PerformanceSourceRow,
  ): CreateRendimientoDTo {
    const bodegaBase = this.calculateBodegaBase(source);
    const calidadBase = this.calculateCalidadBase(source);
    const comprasBase = this.calculateComprasBase(source);

    // Pesos (sobre el scoring base):
    // - Bodega: 30%
    // - Calidad: 40%
    // - Compras: 30%
    const bodegaPerformance = this.scaleScore(bodegaBase, 30);
    const calidadPerformance = this.scaleScore(calidadBase, 40);
    const comprasPerformance = this.scaleScore(comprasBase, 30);

    return {
      purchase_order_item_id: source.purchase_order_item_id,
      proveedor_id: source.proveedor_id,
      bodega_performance: bodegaPerformance,
      calidad_performance: calidadPerformance,
      compras_performance: comprasPerformance,
      total_performance:
        bodegaPerformance + calidadPerformance + comprasPerformance,
    };
  }

  /**
   * Scoring “base” de bodega (antes de aplicar peso 30%).
   */
  private calculateBodegaBase(source: PerformanceSourceRow): number {
    return [
      source.limpieza ? 15 : 0,
      source.equipo_proteccion ? 15 : 0,
      source.identificacion_producto_ok ? 15 : 0,
      source.embalaje_ok ? 20 : 0,
      source.libre_plagas ? 15 : 0,
      source.estado_completitud === 'Completo' ? 20 : 0,
    ].reduce((total, value) => total + value, 0);
  }

  /**
   * Scoring “base” de calidad (antes de aplicar peso 40%).
   */
  private calculateCalidadBase(source: PerformanceSourceRow): number {
    return [
      source.cumple_calidad ? 70 : 0,
      source.cumple_norma ? 30 : 0,
    ].reduce((total, value) => total + value, 0);
  }

  /**
   * Scoring “base” de compras (antes de aplicar peso 30%).
   */
  private calculateComprasBase(source: PerformanceSourceRow): number {
    return (
      this.calculateEntregaScore(source.cumple_entrega) +
      this.calculateServicioScore(source.cumple_servicio)
    );
  }

  /**
   * Score de entrega según el rango.
   */
  private calculateEntregaScore(cumpleEntrega: CumpleEntregaRango | null): number {
    const entregaScoreMap: Record<CumpleEntregaRango, number> = {
      [CumpleEntregaRango.RANGO_0_3]: 60,
      [CumpleEntregaRango.RANGO_4_6]: 50,
      [CumpleEntregaRango.RANGO_7_9]: 40,
      [CumpleEntregaRango.RANGO_10_12]: 20,
      [CumpleEntregaRango.RANGO_13_15]: 10,
      [CumpleEntregaRango.RANGO_MAS_15]: 0,
    };

    return cumpleEntrega ? entregaScoreMap[cumpleEntrega] : 0;
  }

  /**
   * Score de servicio según nivel.
   */
  private calculateServicioScore(cumpleServicio: NivelServicio | null): number {
    const servicioScoreMap: Record<NivelServicio, number> = {
      [NivelServicio.EXCELENTE]: 40,
      [NivelServicio.REGULAR]: 20,
      [NivelServicio.MALO]: 0,
    };

    return cumpleServicio ? servicioScoreMap[cumpleServicio] : 0;
  }

  /**
   * Aplica un peso porcentual a un scoring base y redondea.
   */
  private scaleScore(baseScore: number, weight: number): number {
    return Math.round((baseScore * weight) / 100);
  }

  /**
   * Consulta lista/tabla de rendimientos con información de joins.
   *
   * Usamos SQL nativo para controlar el join y los alias.
   */
  async getData() {
    const query = `
      SELECT
        po.numero_orden_compra,
        pro.nombre as nombre_producto,
        su.nombre as nombre_proveedor,
        re.bodega_performance,
        re.calidad_performance,
        re.compras_performance,
        re.total_performance,
        re.date_performance
      FROM public.rendimientos as re
      INNER JOIN public.purchase_order_items as it On re.purchase_order_item_id = it.id
      INNER JOIN public.products as pro On it.product_id = pro.id
      INNER JOIN public.purchase_orders as po On it.purchase_order_id = po.id
      INNER JOIN public.suppliers as su On re.proveedor_id = su.id;
    `;

    return await this.dataSource.query(query);
  }

  /**
   * Obtiene un rendimiento por ID.
   */
  async getById(id: string): Promise<Rendimiento> {
    const rendimiento = await this.rendimientosRepository.findOne({
      where: { id },
    });

    if (!rendimiento) {
      throw new NotFoundException(`Rendimiento con id ${id} no encontrado`);
    }

    return rendimiento;
  }
}

