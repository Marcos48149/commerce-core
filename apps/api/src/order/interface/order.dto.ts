import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../domain/order.entity';

export class CancelOrderDto {
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}

export class RefundOrderDto {
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}

export class OrderQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() customerId?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(1) limit?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() sortBy?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sortOrder?: 'asc' | 'desc';
}

export class OrderResponseDto {
  id: string;
  storeId: string;
  customerId: string | null;
  orderNumber: number;
  status: string;
  currency: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode: string | null;
  notes: string | null;
  items: OrderItemDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class OrderItemDto {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
