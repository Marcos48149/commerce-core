import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsBoolean, IsArray, IsNumber, IsUrl, Min, ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWebhookDto {
  @ApiProperty() @IsUrl() url: string;
  @ApiProperty() @IsString() secret: string;
  @ApiProperty({ type: [String] })
  @IsArray() @ArrayMinSize(1) @IsString({ each: true })
  events: string[];
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) retryCount?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(100) timeoutMs?: number;
}

export class UpdateWebhookDto {
  @ApiPropertyOptional() @IsOptional() @IsUrl() url?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() secret?: string;
  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @ArrayMinSize(1) @IsString({ each: true })
  events?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) retryCount?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(100) timeoutMs?: number;
}
