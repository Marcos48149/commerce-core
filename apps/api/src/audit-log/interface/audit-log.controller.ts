import {
  Controller, Get, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../iam/guards/permission.guard';
import { RequirePermission } from '../../iam/decorators/permission.decorator';
import { CurrentUser } from '../../iam/decorators/current-user.decorator';
import type { AuthUser } from '../../iam/services/permission-evaluator.service';
import { QueryAuditLogUseCase } from '../application/query-audit-log.use-case';
import { AuditLogQueryDto } from './audit-log.dto';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('audit-logs')
export class AuditLogController {
  constructor(
    private readonly queryAuditLog: QueryAuditLogUseCase,
  ) {}

  @Get()
  @RequirePermission('audit.read')
  async list(@Query() query: AuditLogQueryDto, @CurrentUser() user: AuthUser) {
    return this.queryAuditLog.execute({
      storeId: user.storeId!,
      tenantId: user.tenantId,
      filter: {
        ...query,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
      },
    });
  }
}
