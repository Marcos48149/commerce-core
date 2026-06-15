import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../iam/guards/permission.guard';
import { RequirePermission } from '../../iam/decorators/permission.decorator';
import { CurrentUser } from '../../iam/decorators/current-user.decorator';
import type { AuthUser } from '../../iam/services/permission-evaluator.service';
import { UlidService } from '../../common/ulid.service';
import { WebhookRepository } from '../domain/webhook.repository';
import { WebhookEndpoint } from '../domain/webhook.entity';
import { CreateWebhookDto, UpdateWebhookDto } from './webhook.dto';

@ApiTags('Webhooks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly webhookRepository: WebhookRepository,
    private readonly ulidService: UlidService,
  ) {}

  @Post()
  @RequirePermission('webhook.write')
  async create(@Body() dto: CreateWebhookDto, @CurrentUser() user: AuthUser) {
    const webhook = WebhookEndpoint.create({
      id: this.ulidService.generate(),
      tenantId: user.tenantId,
      storeId: user.storeId!,
      url: dto.url,
      secret: dto.secret,
      events: dto.events as any,
      retryCount: dto.retryCount,
      timeoutMs: dto.timeoutMs,
    });
    await this.webhookRepository.save(webhook);
    return webhook;
  }

  @Get()
  @RequirePermission('webhook.read')
  async list(@CurrentUser() user: AuthUser) {
    return this.webhookRepository.findByStore(user.storeId!);
  }

  @Get(':id')
  @RequirePermission('webhook.read')
  async get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.webhookRepository.findById(id, user.storeId!);
  }

  @Put(':id')
  @RequirePermission('webhook.write')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWebhookDto,
    @CurrentUser() user: AuthUser,
  ) {
    const webhook = await this.webhookRepository.findById(id, user.storeId!);
    if (!webhook) throw new Error('Webhook not found');
    webhook.update({
      ...dto,
      events: dto.events as any,
    });
    await this.webhookRepository.update(webhook);
    return webhook;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('webhook.write')
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.webhookRepository.delete(id, user.storeId!);
  }
}
