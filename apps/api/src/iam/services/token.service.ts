import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

interface TokenPayload {
  sub: string;
  email: string;
  tenantId: string;
  storeId?: string;
  isSuperAdmin: boolean;
  type: 'access' | 'refresh';
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
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
    const privateKey = process.env.JWT_PRIVATE_KEY;
    const publicKey = process.env.JWT_PUBLIC_KEY;

    if (privateKey && publicKey) {
      this.jwks = {
        privateKey: privateKey.replace(/\\n/g, '\n'),
        publicKey: publicKey.replace(/\\n/g, '\n'),
      };
    } else {
      this.logger.warn(
        'JWT_PRIVATE_KEY / JWT_PUBLIC_KEY not set. Generating ephemeral RS256 keys.',
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

  async generateTokens(payload: Omit<TokenPayload, 'type'>): Promise<TokenPair> {
    const accessToken = this.jwtService.sign(
      { ...payload, type: 'access' },
      {
        privateKey: this.jwks!.privateKey,
        algorithm: 'RS256',
        expiresIn: this.accessExpiry,
      },
    );

    const refreshToken = crypto.randomBytes(48).toString('hex');
    const refreshPayload = this.jwtService.sign(
      { ...payload, type: 'refresh', token: refreshToken },
      {
        privateKey: this.jwks!.privateKey,
        algorithm: 'RS256',
        expiresIn: this.refreshExpiry,
      },
    );

    // Store refresh token hash for rotation
    await this.storeRefreshToken(payload.sub, refreshToken);

    return { accessToken, refreshToken: refreshPayload };
  }

  private async storeRefreshToken(adminId: string, token: string) {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    await this.prisma.admin.update({
      where: { id: adminId },
      data: { refreshToken: hash },
    });
  }

  async rotateRefreshToken(
    oldRefreshToken: string,
    payload: Omit<TokenPayload, 'type'>,
  ): Promise<TokenPair | null> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub },
    });

    if (!admin?.refreshToken) return null;

    const oldHash = crypto.createHash('sha256').update(oldRefreshToken).digest('hex');
    if (admin.refreshToken !== oldHash) return null;

    return this.generateTokens(payload);
  }
}
