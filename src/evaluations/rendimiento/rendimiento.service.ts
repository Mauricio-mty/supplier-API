import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,DataSource } from 'typeorm';
import { Rendimiento } from './entities/rendimiento.entity';
import { CreateRendimientoDTo } from './dto/create-rendimiento.dto';

@Injectable()
export class RendimientosService {
  constructor(
    @InjectRepository(Rendimiento)
    private rendimientosRepository: Repository<Rendimiento>,
    private readonly dataSource: DataSource,
) {}

  async create(createRendimientoDto: CreateRendimientoDTo): Promise<Rendimiento> {
    const rendimiento = this.rendimientosRepository.create(createRendimientoDto);
    return this.rendimientosRepository.save(rendimiento);
  }

  async getAll(): Promise<Rendimiento[]> {
    return this.rendimientosRepository.find();
  }

  async getData(){
    const query=`
        SELECT
    po.numero_orden_compra,
	pro.nombre,
	su.nombre,
	re.bodega_performance,
	re.calidad_performance,
	re.compras_performance,
	re.total_performance
FROM public.rendimientos as re
INNER JOIN public.purchase_order_items as it On re.purchase_order_item_id = it.id
INNER JOIN public.products as pro On it.product_id=pro.id
INNER JOIN public.purchase_orders as po on it.purchase_order_id=po.id
INNER JOIN public.suppliers as su on re.proveedor_id=su.id 
    ` ;
    return await this.dataSource.query(query);
  }

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
