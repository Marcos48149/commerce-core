import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class UpdateCustomerProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() displayName?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
}

export class CreateAddressDto {
  @ApiProperty({ default: 'shipping' }) @IsString() type!: string;

  @ApiProperty() @IsString() line1!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() line2?: string;

  @ApiProperty() @IsString() city!: string;

  @ApiProperty() @IsString() province!: string;

  @ApiProperty() @IsString() postalCode!: string;

  @ApiPropertyOptional({ default: 'AR' }) @IsOptional() @IsString() country?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() isDefault?: boolean;
}

export class UpdateAddressDto {
  @ApiPropertyOptional() @IsOptional() @IsString() type?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() line1?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() line2?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() province?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() postalCode?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() country?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() isDefault?: boolean;
}
