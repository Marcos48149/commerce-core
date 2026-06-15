import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsInt, Min } from 'class-validator';

export class AddItemDto {
  @ApiProperty() @IsString() variantId!: string;
  @ApiProperty() @IsString() productId!: string;
  @ApiProperty() @IsInt() @Min(1) quantity!: number;
  @ApiProperty() @IsNumber() @Min(0) unitPrice!: number;
}

export class UpdateItemDto {
  @ApiProperty() @IsString() variantId!: string;
  @ApiProperty() @IsInt() @Min(1) quantity!: number;
}

export class RemoveItemDto {
  @ApiProperty() @IsString() variantId!: string;
}

export class ApplyCouponDto {
  @ApiProperty() @IsString() couponCode!: string;
}

export class CalculateShippingDto {
  @ApiProperty() @IsNumber() @Min(0) shippingCost!: number;
}

export class InitiateCheckoutDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) shippingCost?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class CartResponseDto {
  id!: string;
  storeId!: string;
  customerId!: string | null;
  guestToken!: string | null;
  couponCode!: string | null;
  currency!: string;
  subtotal!: number;
  discount!: number;
  shipping!: number;
  total!: number;
  items!: CartItemDto[];
}

export class CartItemDto {
  id!: string;
  variantId!: string;
  productId!: string;
  quantity!: number;
  unitPrice!: number;
  totalPrice!: number;
}
