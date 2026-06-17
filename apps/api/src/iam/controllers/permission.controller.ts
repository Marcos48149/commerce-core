import {
  Controller, Get, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PrismaClient } from '@prisma/client';
import { PermissionGuard } from '../guards/permission.guard';
import { RequirePermission } from '../decorators/permission.decorator';

@ApiTags('IAM / Permissions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('iam/permissions')
export class PermissionController {
  constructor(private readonly prisma: PrismaClient) {}

  @Get()
  @RequirePermission('permission.read')
  async list() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ group: 'asc' }, { name: 'asc' }],
    });

    const grouped: Record<string, typeof permissions> = {};
    for (const perm of permissions) {
      if (!grouped[perm.group]) grouped[perm.group] = [];
      grouped[perm.group]!.push(perm);
    }

    return grouped;
  }
}
