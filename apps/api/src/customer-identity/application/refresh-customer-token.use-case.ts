import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomerTokenService } from './customer-token.service';

@Injectable()
export class RefreshCustomerTokenUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tokenService: CustomerTokenService,
  ) {}

  async execute(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<{
        sub: string;
        email: string;
        storeId: string;
        token: string;
        type: string;
      }>(refreshToken, {
        algorithms: ['RS256'],
        ignoreExpiration: false,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const tokens = await this.tokenService.rotateRefreshToken(payload.token, {
        sub: payload.sub,
        email: payload.email,
        storeId: payload.storeId,
      });

      if (!tokens) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      return tokens;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
