import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

interface CustomerTokenPayload {
  sub: string;
  email: string;
  storeId: string;
  type: 'access' | 'refresh';
}

@Injectable()
export class CustomerTokenService {
  private readonly logger = new Logger(CustomerTokenService.name);
  private readonly accessExpiry = '15m';
  private readonly refreshExpiry = '30d';
  private jwks: { publicKey: string; privateKey: string } | null = null;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaClient,
  ) {
    this.loadKeys();
  }

  private loadKeys() {
    const privateKey = process.env.CUSTOMER_JWT_PRIVATE_KEY;
    const publicKey = process.env.CUSTOMER_JWT_PUBLIC_KEY;

    if (privateKey && publicKey) {
      this.jwks = {
        privateKey: privateKey.replace(/\\n/g, '\n'),
        publicKey: publicKey.replace(/\\n/g, '\n'),
      };
    } else {
      this.logger.warn(
        'CUSTOMER_JWT_PRIVATE_KEY / CUSTOMER_JWT_PUBLIC_KEY not set. Generating ephemeral RS256 keys.',
      );
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      this.jwks = { publicKey, privateKey };
    }
  }

  getPublicKey(): string {
    return this.jwks!.publicKey;
  }

  async generateTokens(payload: Omit<CustomerTokenPayload, 'type'>): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = this.jwtService.sign(
      { ...payload, type: 'access' },
      {
        privateKey: this.jwks!.privateKey,
        algorithm: 'RS256',
        expiresIn: this.accessExpiry,
      },
    );

    const refreshToken = crypto.randomBytes(48).toString('hex');
    const refreshJwt = this.jwtService.sign(
      { ...payload, type: 'refresh', token: refreshToken },
      {
        privateKey: this.jwks!.privateKey,
        algorithm: 'RS256',
        expiresIn: this.refreshExpiry,
      },
    );

    await this.storeRefreshToken(payload.sub, refreshToken);
    return { accessToken, refreshToken: refreshJwt };
  }

  private async storeRefreshToken(customerId: string, token: string) {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    await this.prisma.customer.update({
      where: { id: customerId },
      data: { refreshToken: hash },
    });
  }

  async rotateRefreshToken(
    oldRefreshToken: string,
    payload: Omit<CustomerTokenPayload, 'type'>,
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: payload.sub },
    });

    if (!customer?.refreshToken) return null;

    const oldHash = crypto.createHash('sha256').update(oldRefreshToken).digest('hex');
    if (customer.refreshToken !== oldHash) return null;

    return this.generateTokens(payload);
  }
}
