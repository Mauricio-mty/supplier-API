import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Si es Admin o Admin Administrativo, tiene acceso total siempre
    if (user.rol === UserRole.ADMIN || user.rol === UserRole.ADMIN_ADMIN) {
      return true;
    }

    const hasRole = requiredRoles.some((role) => user.rol === role);
    
    if (!hasRole) {
        throw new ForbiddenException('No tienes permisos suficientes para realizar esta acción');
    }
    
    return true;
  }
}
