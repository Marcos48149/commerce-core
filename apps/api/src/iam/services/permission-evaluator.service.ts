import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ForbiddenError } from '@commerce/shared';

export interface AuthUser {
  id: string;
  tenantId: string;
  storeId?: string;
  isSuperAdmin: boolean;
}

@Injectable()
export class PermissionEvaluator {
  constructor(private readonly prisma: PrismaClient) {}

  async hasPermission(
    user: AuthUser,
    permissionName: string,
    scope?: { tenantId?: string; storeId?: string },
  ): Promise<boolean> {
    if (user.isSuperAdmin) return true;

    if (scope?.tenantId && scope.tenantId !== user.tenantId) return false;

    const permission = await this.prisma.permission.findUnique({
      where: { name: permissionName },
    });

    if (!permission) return false;

    const adminRoles = await this.prisma.adminRole.findMany({
      where: { adminId: user.id },
      include: {
        role: {
          include: {
            permissions: {
              where: { permissionId: permission.id },
            },
          },
        },
      },
    });

    return adminRoles.some((ar: any) => {
      if (ar.role.permissions.length === 0) return false;

      if (scope?.storeId && ar.role.scope === 'store') {
        const admin = ar.adminId === user.id;
        return admin;
      }

      return ar.role.permissions.length > 0;
    });
  }

  async requirePermission(
    user: AuthUser,
    permissionName: string,
    scope?: { tenantId?: string; storeId?: string },
  ): Promise<void> {
    const has = await this.hasPermission(user, permissionName, scope);
    if (!has) {
      throw new ForbiddenError(
        `Missing required permission: ${permissionName}`,
      );
    }
  }

  async resolveScope(user: AuthUser): Promise<{ tenantId: string; storeId?: string }> {
    if (user.isSuperAdmin) {
      return { tenantId: user.tenantId };
    }

    return {
      tenantId: user.tenantId,
      storeId: user.storeId,
    };
  }
}
