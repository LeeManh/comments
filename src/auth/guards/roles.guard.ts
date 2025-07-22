import { Reflector } from '@nestjs/core';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserRole } from 'src/commons/types/user.type';
import { ROLES_KEY } from 'src/commons/decorators/roles.decorator';
import { User } from 'src/models/user.model';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const user = context.switchToHttp().getRequest()?.user as User;
    if (!user) return false;

    return requiredRoles.some((role) => user.role === role);
  }
}
