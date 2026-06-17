import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { NotFoundError } from '@commerce/shared';
import { ApiKeyEntity } from '../domain/api-key.entity';

@Injectable()
export class ApiKeyService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(adminId: string) {
    const keys = await this.prisma.apiKey.findMany({
      where: { adminId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return keys.map((k) => ApiKeyEntity.fromPrisma(k).toResponse());
  }

  async create(
    dto: { name: string; scopes?: string[]; expiresAt?: string },
    adminId: string,
    tenantId: string,
    storeId?: string,
  ) {
    const rawKey = crypto.randomBytes(32).toString('hex');
    const prefix = rawKey.substring(0, 8);
    const hash = await bcrypt.hash(rawKey, 12);

    const apiKey = await this.prisma.apiKey.create({
      data: {
        tenantId,
        storeId,
        adminId,
        name: dto.name,
        prefix,
        hash,
        scopes: dto.scopes ?? [],
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });

    return {
      ...ApiKeyEntity.fromPrisma(apiKey).toResponse(),
      rawKey,
    };
  }

  async update(id: string, dto: { name?: string; isActive?: boolean; scopes?: string[] }, adminId: string) {
    const key = await this.prisma.apiKey.findFirst({
      where: { id, adminId, deletedAt: null },
    });
    if (!key) throw new NotFoundError('ApiKey', id);

    const updated = await this.prisma.apiKey.update({
      where: { id },
      data: {
        name: dto.name,
        isActive: dto.isActive,
        scopes: dto.scopes,
      },
    });

    return ApiKeyEntity.fromPrisma(updated).toResponse();
  }

  async delete(id: string, adminId: string) {
    const key = await this.prisma.apiKey.findFirst({
      where: { id, adminId, deletedAt: null },
    });
    if (!key) throw new NotFoundError('ApiKey', id);

    await this.prisma.apiKey.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
