import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ApiKeyStrategy } from './strategies/api-key.strategy';
import { PermissionEvaluator } from './services/permission-evaluator.service';
import { TokenService } from './services/token.service';
import { AdminService } from './services/admin.service';
import { RoleService } from './services/role.service';
import { ApiKeyService } from './services/api-key.service';
import { AuthController } from './controllers/auth.controller';
import { AdminController } from './controllers/admin.controller';
import { RoleController } from './controllers/role.controller';
import { ApiKeyController } from './controllers/api-key.controller';
import { PermissionController } from './controllers/permission.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [
    AuthController,
    AdminController,
    RoleController,
    ApiKeyController,
    PermissionController,
  ],
  providers: [
    JwtStrategy,
    ApiKeyStrategy,
    PermissionEvaluator,
    TokenService,
    AdminService,
    RoleService,
    ApiKeyService,
  ],
  exports: [
    JwtStrategy,
    ApiKeyStrategy,
    PermissionEvaluator,
    TokenService,
    AdminService,
    RoleService,
    ApiKeyService,
  ],
})
export class IamModule {}
