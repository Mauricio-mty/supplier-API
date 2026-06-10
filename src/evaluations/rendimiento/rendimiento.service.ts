import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rendimiento } from './entities/rendimiento.entity';
import { CreateRendimientoDTo } from './dto/create-rendimiento.dto';

@Injectable()
export class RendimientosService {
  constructor(
    @InjectRepository(Rendimiento)
    private rendimientosRepository: Repository<Rendimiento>,
  ) {}

  async create(createRendimientoDto: CreateRendimientoDTo): Promise<Rendimiento> {
    const rendimiento = this.rendimientosRepository.create(createRendimientoDto);
    return this.rendimientosRepository.save(rendimiento);
  }

  async getAll(): Promise<Rendimiento[]> {
    return this.rendimientosRepository.find();
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
