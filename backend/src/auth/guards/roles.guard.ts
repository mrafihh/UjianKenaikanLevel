// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Jika rute tidak ditandai @Roles, berarti rute itu bebas diakses (Public)
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    // Cek apakah role user yang login sesuai dengan role yang diwajibkan oleh rute
    const hasRole = requiredRoles.includes(user?.role);
    if (!hasRole) {
      throw new ForbiddenException('Anda tidak memiliki hak akses untuk fitur ini!');
    }
    
    return true;
  }
}