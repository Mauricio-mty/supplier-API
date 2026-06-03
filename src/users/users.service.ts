import { Injectable } from '@nestjs/common';
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
  async findOneByCorreo(correo: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { correo },
    });
  }
}