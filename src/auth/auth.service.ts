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

    // 3. Verificamos la contraseña
    // Se soportan hashes bcrypt ($2a$/$2b$/$2y$) y, por compatibilidad con los
    // seeds actuales, también contraseñas en texto plano.
    if (user && (await this.matchesPassword(password, user.password))) {
      const { password: _password, ...result } = user;
      return result;
    }

    throw new UnauthorizedException('Credenciales incorrectas');
  }

  /**
   * Compara el password enviado contra el almacenado.
   *
   * Si el valor almacenado parece un hash bcrypt se usa `bcrypt.compare`;
   * en caso contrario se cae a comparación en texto plano para no romper
   * los usuarios que todavía no tienen la contraseña hasheada.
   */
  private async matchesPassword(
    plainPassword: string,
    storedPassword: string,
  ): Promise<boolean> {
    if (/^\$2[aby]\$\d{2}\$/.test(storedPassword)) {
      return bcrypt.compare(plainPassword, storedPassword);
    }
    return storedPassword === plainPassword;
  }

  async login(user: any) {
    const payload = {
      correo: user.correo,
      sub: user.id,
      rol: user.rol,
      nombre: user.nombre,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
      },
    };
  }
}
