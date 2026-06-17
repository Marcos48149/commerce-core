import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { NotFoundError, ConflictError, ValidationError } from '@commerce/shared';
import { AdminEntity } from '../domain/admin.entity';

@Injectable()
export class AdminService {
  private readonly saltRounds = 12;

  constructor(private readonly prisma: PrismaClient) {}

  async list(tenantId: string) {
    const admins = await this.prisma.admin.findMany({
      where: { tenantId, deletedAt: null },
      include: { roles: { include: { role: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return admins.map((a) => AdminEntity.fromPrisma(a).toResponse());
  }

  async create(
    dto: { email: string; password: string; displayName: string; storeId?: string; isSuperAdmin?: boolean; roleIds?: string[] },
    tenantId: string,
    storeId?: string,
  ) {
    const existing = await this.prisma.admin.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictError('Admin with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);

    const admin = await this.prisma.admin.create({
      data: {
        tenantId,
        storeId: dto.storeId ?? storeId,
        email: dto.email,
        passwordHash,
        displayName: dto.displayName,
        isSuperAdmin: dto.isSuperAdmin ?? false,
        roles: dto.roleIds?.length
          ? { create: dto.roleIds.map((roleId) => ({ roleId })) }
          : undefined,
      },
      include: { roles: { include: { role: true } } },
    });

    return AdminEntity.fromPrisma(admin).toResponse();
  }

  async getById(id: string, tenantId: string) {
    const admin = await this.prisma.admin.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { roles: { include: { role: true } } },
    });
    if (!admin) throw new NotFoundError('Admin', id);
    return AdminEntity.fromPrisma(admin).toResponse();
  }

  async update(id: string, dto: { email?: string; displayName?: string; isActive?: boolean }, tenantId: string) {
    const admin = await this.prisma.admin.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!admin) throw new NotFoundError('Admin', id);

    if (dto.email && dto.email !== admin.email) {
      const existing = await this.prisma.admin.findUnique({ where: { email: dto.email } });
      if (existing) throw new ConflictError('Email already in use');
    }

    const updated = await this.prisma.admin.update({
      where: { id },
      data: {
        email: dto.email,
        displayName: dto.displayName,
        isActive: dto.isActive,
      },
      include: { roles: { include: { role: true } } },
    });

    return AdminEntity.fromPrisma(updated).toResponse();
  }

  async softDelete(id: string, tenantId: string) {
    const admin = await this.prisma.admin.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!admin) throw new NotFoundError('Admin', id);

    await this.prisma.admin.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getProfile(adminId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      include: { roles: { include: { role: true } } },
    });
    if (!admin || admin.deletedAt) throw new NotFoundError('Admin', adminId);
    return AdminEntity.fromPrisma(admin).toResponse();
  }

  async updateProfile(adminId: string, dto: { displayName: string }) {
    const admin = await this.prisma.admin.update({
      where: { id: adminId },
      data: { displayName: dto.displayName },
      include: { roles: { include: { role: true } } },
    });
    return AdminEntity.fromPrisma(admin).toResponse();
  }

  async changePassword(adminId: string, currentPassword: string, newPassword: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin || admin.deletedAt) throw new NotFoundError('Admin', adminId);

    const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!valid) throw new ValidationError('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, this.saltRounds);
    await this.prisma.admin.update({
      where: { id: adminId },
      data: { passwordHash },
    });
  }

  async assignRole(adminId: string, roleId: string, tenantId: string) {
    const admin = await this.prisma.admin.findFirst({
      where: { id: adminId, tenantId, deletedAt: null },
    });
    if (!admin) throw new NotFoundError('Admin', adminId);

    const role = await this.prisma.role.findFirst({
      where: { id: roleId, tenantId, deletedAt: null },
    });
    if (!role) throw new NotFoundError('Role', roleId);

    const existing = await this.prisma.adminRole.findUnique({
      where: { adminId_roleId: { adminId, roleId } },
    });
    if (existing) return;

    await this.prisma.adminRole.create({
      data: { adminId, roleId },
    });
  }

  async removeRole(adminId: string, roleId: string, tenantId: string) {
    const admin = await this.prisma.admin.findFirst({
      where: { id: adminId, tenantId, deletedAt: null },
    });
    if (!admin) throw new NotFoundError('Admin', adminId);

    const role = await this.prisma.role.findFirst({
      where: { id: roleId, tenantId },
    });
    if (!role) throw new NotFoundError('Role', roleId);

    if (role.isSystem) {
      throw new ValidationError('Cannot remove a system role');
    }

    const existing = await this.prisma.adminRole.findUnique({
      where: { adminId_roleId: { adminId, roleId } },
    });
    if (!existing) return;

    await this.prisma.adminRole.delete({
      where: { adminId_roleId: { adminId, roleId } },
    });
  }
}
