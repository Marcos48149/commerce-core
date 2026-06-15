import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-strategy';
import { Request } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

interface ApiKeyUser {
  id: string;
  tenantId: string;
  storeId?: string;
  adminId: string;
  keyId: string;
}

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }

  async validate(): Promise<unknown> {
    return null;
  }

  override authenticate(req: Request) {
    const apiKey = req.headers['x-api-key'] as string | undefined;

    if (!apiKey) {
      return this.fail(new UnauthorizedException('Missing API key'), 401);
    }

    this.validateApiKey(apiKey)
      .then((user) => {
        if (user) {
          this.success(user);
        } else {
          this.fail(new UnauthorizedException('Invalid API key'), 401);
        }
      })
      .catch((err) => {
        this.error(err);
      });
  }

  private async validateApiKey(key: string): Promise<ApiKeyUser | null> {
    const prefix = key.substring(0, 8);

    // Fast lookup by prefix — narrows to O(1) candidates
    const candidates = await this.prisma.apiKey.findMany({
      where: {
        prefix,
        isActive: true,
        AND: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      select: {
        id: true,
        hash: true,
        adminId: true,
        admin: {
          select: {
            id: true,
            tenantId: true,
            storeId: true,
            isActive: true,
          },
        },
      },
      take: 5,
    });

    for (const candidate of candidates) {
      if (!candidate.admin.isActive) continue;

      try {
        const match = await bcrypt.compare(key, candidate.hash);
        if (match) {
          // Update lastUsedAt in background (fire-and-forget)
          this.prisma.apiKey
            .update({ where: { id: candidate.id }, data: { lastUsedAt: new Date() } })
            .catch(() => {});

          return {
            id: candidate.admin.id,
            tenantId: candidate.admin.tenantId,
            storeId: candidate.admin.storeId ?? undefined,
            adminId: candidate.admin.id,
            keyId: candidate.id,
          };
        }
      } catch {
        continue;
      }
    }

    return null;
  }
}
