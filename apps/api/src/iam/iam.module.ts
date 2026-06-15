import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ApiKeyStrategy } from './strategies/api-key.strategy';
import { PermissionEvaluator } from './services/permission-evaluator.service';
import { TokenService } from './services/token.service';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    ApiKeyStrategy,
    PermissionEvaluator,
    TokenService,
  ],
  exports: [JwtStrategy, ApiKeyStrategy, PermissionEvaluator, TokenService],
})
export class IamModule {}
