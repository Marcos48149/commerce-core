import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsObject, Min } from 'class-validator';

export class UpdateTenantDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() slug?: string;
}

export class CreateStoreDto {
  @ApiProperty() @IsString() name!: string;

  @ApiProperty() @IsString() slug!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() planId?: string;

  @ApiPropertyOptional({ default: 'ARS' }) @IsOptional() @IsString() currency?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() displayName?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() logoUrl?: string;

  @ApiPropertyOptional() @IsOptional() @IsObject() settings?: Record<string, unknown>;
}

export class UpdateStoreDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() slug?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() planId?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() currency?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() displayName?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() logoUrl?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsObject() settings?: Record<string, unknown>;
}

export class CreatePlanDto {
  @ApiProperty() @IsString() name!: string;

  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsNumber() @Min(1) maxStores?: number;

  @ApiPropertyOptional({ default: 10 }) @IsOptional() @IsNumber() @Min(1) maxAdmins?: number;

  @ApiPropertyOptional({ default: 1000 }) @IsOptional() @IsNumber() @Min(1) maxProducts?: number;

  @ApiPropertyOptional({ default: 10 }) @IsOptional() @IsNumber() @Min(1) maxWebhooks?: number;

  @ApiPropertyOptional() @IsOptional() @IsObject() features?: Record<string, unknown>;

  @ApiProperty() @IsNumber() @Min(0) monthlyPrice!: number;
}

export class UpdatePlanDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) maxStores?: number;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) maxAdmins?: number;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) maxProducts?: number;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) maxWebhooks?: number;

  @ApiPropertyOptional() @IsOptional() @IsObject() features?: Record<string, unknown>;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) monthlyPrice?: number;
}
