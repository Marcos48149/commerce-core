import {
  Controller, Get, Post, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../iam/guards/permission.guard';
import { RequirePermission } from '../../iam/decorators/permission.decorator';
import { CurrentUser } from '../../iam/decorators/current-user.decorator';
import type { AuthUser } from '../../iam/services/permission-evaluator.service';
import { InventoryRepository } from '../domain/inventory.repository';
import { ReserveStockCommand } from '../application/commands/reserve-stock.handler';
import { ConfirmStockCommand } from '../application/commands/confirm-stock.handler';
import { CancelReservationCommand } from '../application/commands/cancel-reservation.handler';
import { AdjustStockCommand } from '../application/commands/adjust-stock.handler';
import { GetStockQuery } from '../application/queries/get-stock.handler';
import {
  ReserveStockDto, ConfirmStockDto, CancelReservationDto,
  AdjustStockDto, StockQueryDto,
} from './inventory.dto';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly inventoryRepository: InventoryRepository,
  ) {}

  @Post('reserve')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('stock.write')
  async reserve(@Body() dto: ReserveStockDto, @CurrentUser() user: AuthUser) {
    return this.commandBus.execute(
      new ReserveStockCommand(
        dto.variantId,
        dto.productId,
        user.storeId!,
        user.tenantId,
        dto.quantity,
        dto.referenceId,
      ),
    );
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('stock.write')
  async confirm(@Body() dto: ConfirmStockDto, @CurrentUser() user: AuthUser) {
    return this.commandBus.execute(
      new ConfirmStockCommand(dto.variantId, user.storeId!, dto.quantity, dto.referenceId),
    );
  }

  @Post('cancel-reservation')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('stock.write')
  async cancelReservation(@Body() dto: CancelReservationDto, @CurrentUser() user: AuthUser) {
    return this.commandBus.execute(
      new CancelReservationCommand(dto.variantId, user.storeId!, dto.quantity, dto.referenceId),
    );
  }

  @Post('adjust')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('stock.write')
  async adjust(@Body() dto: AdjustStockDto, @CurrentUser() user: AuthUser) {
    return this.commandBus.execute(
      new AdjustStockCommand(dto.variantId, user.storeId!, dto.quantity, dto.reason, dto.referenceId),
    );
  }

  @Get()
  @RequirePermission('stock.read')
  async getStock(@Query() query: StockQueryDto, @CurrentUser() user: AuthUser) {
    if (query.variantId) {
      return this.queryBus.execute(new GetStockQuery(query.variantId, user.storeId!));
    }

    if (query.productId) {
      return this.inventoryRepository.findByProduct(query.productId, user.storeId!);
    }

    if (query.lowStockThreshold !== undefined) {
      return this.inventoryRepository.findLowStock(user.storeId!, query.lowStockThreshold);
    }

    return [];
  }
}
