import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsEnum } from 'class-validator';

export class CreateShippingMethodDto {
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsEnum(['fixed', 'free_over', 'local_pickup', 'zone_based']) type!: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) cost?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) freeOver?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() sortOrder?: number;
}

export class UpdateShippingMethodDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) cost?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) freeOver?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() sortOrder?: number;
}

export class CalculateRateDto {
  @ApiProperty() @IsNumber() @Min(0) subtotal!: number;
  @ApiProperty() @IsString() country!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() province?: string;
}
