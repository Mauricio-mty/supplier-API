import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service'; 
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<any> {
    // 1. Desestructuramos 'correo' en lugar de 'username' 
    const { correo, password } = loginDto;
    
    // 2. Buscamos en el servicio usando el nuevo método por correo
    const user = await this.usersService.findOneByCorreo(correo);
    
    // 3. Verificamos la contraseña encriptada
    /*if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result; 
    }*/

      if (user && user.password === password) {
      const { password, ...result } = user;
      return result; 
    }
    
    throw new UnauthorizedException('Credenciales incorrectas');
  }

  async login(user: any) {
    const payload = { 
      correo: user.correo, 
      sub: user.id, 
      rol: user.rol, 
      nombre: user.nombre 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol
      }
    };
  }
}