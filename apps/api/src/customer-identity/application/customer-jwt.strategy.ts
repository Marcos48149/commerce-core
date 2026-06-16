import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaClient } from '@prisma/client';
import { CustomerTokenService } from './customer-token.service';

interface CustomerJwtPayload {
  sub: string;
  email: string;
  storeId: string;
  type: string;
}

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy, 'customer-jwt') {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly tokenService: CustomerTokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['RS256'],
      secretOrKey: tokenService.getPublicKey(),
    });
  }

  async validate(payload: CustomerJwtPayload) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: payload.sub },
      select: { id: true, isActive: true },
    });

    if (!customer || !customer.isActive) {
      throw new UnauthorizedException('Customer not found or inactive');
    }

    return {
      id: payload.sub,
      email: payload.email,
      storeId: payload.storeId,
    };
  }
}
