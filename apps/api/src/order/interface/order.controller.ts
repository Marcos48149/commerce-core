import {
  Controller, Get, Post, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../iam/guards/permission.guard';
import { RequirePermission } from '../../iam/decorators/permission.decorator';
import { CurrentUser } from '../../iam/decorators/current-user.decorator';
import type { AuthUser } from '../../iam/services/permission-evaluator.service';
import { ConfirmOrderCommand } from '../application/commands/confirm-order.handler';
import { CancelOrderCommand } from '../application/commands/cancel-order.handler';
import { RefundOrderCommand } from '../application/commands/refund-order.handler';
import { GetOrderQuery } from '../application/queries/get-order.handler';
import { ListOrdersQuery } from '../application/queries/list-orders.handler';
import { CancelOrderDto, RefundOrderDto, OrderQueryDto } from './order.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('orders')
export class OrderController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @RequirePermission('order.read')
  async list(@Query() query: OrderQueryDto, @CurrentUser() user: AuthUser) {
    return this.queryBus.execute(
      new ListOrdersQuery(user.storeId!, query),
    );
  }

  @Get(':id')
  @RequirePermission('order.read')
  async get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.queryBus.execute(new GetOrderQuery(id, user.storeId!));
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('order.write')
  async confirm(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.commandBus.execute(new ConfirmOrderCommand(id, user.storeId!));
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('order.write')
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.commandBus.execute(new CancelOrderCommand(id, user.storeId!, dto.reason));
  }

  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('order.write')
  async refund(
    @Param('id') id: string,
    @Body() dto: RefundOrderDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.commandBus.execute(new RefundOrderCommand(id, user.storeId!, dto.reason));
  }
}
