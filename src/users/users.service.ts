import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>, // 💡 Inyectamos la tabla de usuarios
  ) {}

  // 💡 Este es el método que resolverá el segundo error de compilación
  // `password` está marcado con `select: false`, así que hay que pedirlo
  // explícitamente para poder validar el login.
  async findOneByCorreo(correo: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.correo = :correo', { correo })
      .getOne();
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { nombre: 'ASC' } });
  }

  async findOneById(id: string): Promise<User> {
    const usuario = await this.usersRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`El usuario con ID ${id} no existe.`);
    }
    return usuario;
  }
}
