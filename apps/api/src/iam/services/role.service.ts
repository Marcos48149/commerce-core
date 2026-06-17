import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { NotFoundError, ValidationError } from '@commerce/shared';
import { RoleEntity } from '../domain/role.entity';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(tenantId: string) {
    const roles = await this.prisma.role.findMany({
      where: { tenantId, deletedAt: null },
      include: { permissions: { include: { permission: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return roles.map((r) => RoleEntity.fromPrisma(r).toResponse());
  }

  async create(dto: { name: string; scope?: string; permissionIds?: string[] }, tenantId: string) {
    const existing = await this.prisma.role.findUnique({
      where: { tenantId_name: { tenantId, name: dto.name } },
    });
    if (existing) throw new ValidationError(`Role '${dto.name}' already exists`);

    const role = await this.prisma.role.create({
      data: {
        tenantId,
        name: dto.name,
        scope: dto.scope ?? 'store',
        permissions: dto.permissionIds?.length
          ? { create: dto.permissionIds.map((permissionId) => ({ permissionId })) }
          : undefined,
      },
      include: { permissions: { include: { permission: true } } },
    });

    return RoleEntity.fromPrisma(role).toResponse();
  }

  async getById(id: string, tenantId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { permissions: { include: { permission: true } } },
    });
    if (!role) throw new NotFoundError('Role', id);
    return RoleEntity.fromPrisma(role).toResponse();
  }

  async update(
    id: string,
    dto: { name?: string; scope?: string; permissionIds?: string[] },
    tenantId: string,
  ) {
    const role = await this.prisma.role.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!role) throw new NotFoundError('Role', id);
    if (role.isSystem && dto.name) throw new ValidationError('Cannot rename a system role');

    if (dto.permissionIds !== undefined) {
      await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
      if (dto.permissionIds.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: dto.permissionIds.map((permissionId) => ({ roleId: id, permissionId })),
        });
      }
    }

    const updated = await this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        scope: dto.scope,
      },
      include: { permissions: { include: { permission: true } } },
    });

    return RoleEntity.fromPrisma(updated).toResponse();
  }

  async delete(id: string, tenantId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!role) throw new NotFoundError('Role', id);
    if (role.isSystem) throw new ValidationError('Cannot delete a system role');

    await this.prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
