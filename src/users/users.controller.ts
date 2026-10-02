import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 👤 Listar usuarios (solo personal administrativo)
  @Get()
  @Roles(UserRole.ADMIN, UserRole.ADMIN_ADMIN)
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // 🔎 Perfil del usuario autenticado
  @Get('me')
  me(@Req() req): User {
    return req.user;
  }
}
