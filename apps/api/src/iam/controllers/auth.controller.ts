import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { TokenService } from '../services/token.service';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    const admin = await this.prisma.admin.findUnique({
      where: { email: body.email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        displayName: true,
        isSuperAdmin: true,
        tenantId: true,
        storeId: true,
        isActive: true,
      },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(body.password, admin.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.tokenService.generateTokens({
      sub: admin.id,
      email: admin.email,
      tenantId: admin.tenantId,
      storeId: admin.storeId ?? undefined,
      isSuperAdmin: admin.isSuperAdmin,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      admin: {
        id: admin.id,
        email: admin.email,
        displayName: admin.displayName,
        isSuperAdmin: admin.isSuperAdmin,
      },
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { refreshToken: string }) {
    try {
      const payload = this.jwtService.verify<{
        sub: string;
        email: string;
        tenantId: string;
        storeId?: string;
        isSuperAdmin: boolean;
        token: string;
        type: string;
      }>(body.refreshToken, {
        algorithms: ['RS256'],
        ignoreExpiration: false,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const tokens = await this.tokenService.rotateRefreshToken(
        payload.token,
        {
          sub: payload.sub,
          email: payload.email,
          tenantId: payload.tenantId,
          storeId: payload.storeId,
          isSuperAdmin: payload.isSuperAdmin,
        },
      );

      if (!tokens) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
