import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class RegisterCustomerDto {
  @ApiProperty() @IsEmail() email!: string;

  @ApiProperty() @IsString() @MinLength(8) password!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() displayName?: string;

  @ApiPropertyOptional({ default: 'default' }) @IsOptional() @IsString() storeId?: string;
}

export class LoginCustomerDto {
  @ApiProperty() @IsEmail() email!: string;

  @ApiProperty() @IsString() password!: string;

  @ApiPropertyOptional({ default: 'default' }) @IsOptional() @IsString() storeId?: string;
}

export class RefreshCustomerTokenDto {
  @ApiProperty() @IsString() refreshToken!: string;
}
