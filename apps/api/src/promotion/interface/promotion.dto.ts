import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsBoolean, IsNumber, IsDateString, IsEnum, IsObject, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PromotionType } from '../domain/promotion.entity';

export class CreatePromotionDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ enum: PromotionType }) @IsEnum(PromotionType) type: PromotionType;
  @ApiPropertyOptional() @IsOptional() @IsObject() config?: Record<string, unknown>;
  @ApiProperty() @IsDateString() startsAt: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endsAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) minQuantity?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) minCartAmount?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() targetProductId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() targetCategoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() targetPaymentMethod?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) maxUsage?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() priority?: number;
}

export class UpdatePromotionDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() config?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startsAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endsAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) minQuantity?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) minCartAmount?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() targetProductId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() targetCategoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() targetPaymentMethod?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) maxUsage?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() priority?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class PromotionQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsEnum(PromotionType) type?: PromotionType;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() page?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() limit?: number;
}

export class AddCouponDto {
  @ApiProperty() @IsString() code: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) maxUsage?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) maxPerCustomer?: number;
}

export class CouponQueryDto {
  @ApiProperty() @IsString() code: string;
}
