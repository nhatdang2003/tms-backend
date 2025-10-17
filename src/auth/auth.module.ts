import { Module, forwardRef, DynamicModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from '../users/users.module'
import { RolesModule } from '../roles/roles.module'
import { JwtStrategy } from './strategies/jwt.strategy'
import { RolesGuard } from './guards/roles.guard'
import { RoleBasedAuthGuard } from './guards/role-based-auth.guard'
import { PermissionsGuard } from './guards/permissions.guard'
import { RefreshToken } from './entities/refresh-token.entity'
import { LocalStrategy } from './strategies/local.strategy'
import { TokenService } from './services/token.service'
import { PermissionCheckerService } from './services/permission-checker.service'
import { PermissionLoggingInterceptor } from './interceptors/permission-logging.interceptor'
import { CacheModule } from '@nestjs/cache-manager'
import * as redisStore from 'cache-manager-redis-store'
import { User } from '../users/entities/user.entity'
import { MailService } from './services/mail-sender.service'

const cacheModule = CacheModule as unknown as {
  registerAsync(options: any): DynamicModule
}

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    forwardRef(() => UsersModule),
    forwardRef(() => RolesModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
        },
      }),
    }),
    cacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
        ttl: configService.get<number>('CACHE_TTL', 60 * 60),
        password: configService.get<string>('REDIS_PASSWORD', ''),
      }),
      isGlobal: true,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    LocalStrategy,
    JwtStrategy,
    RolesGuard,
    RoleBasedAuthGuard,
    PermissionsGuard,
    PermissionCheckerService,
    PermissionLoggingInterceptor,
    MailService,
  ],
  exports: [
    AuthService,
    TokenService,
    RolesGuard,
    RoleBasedAuthGuard,
    PermissionsGuard,
    PermissionCheckerService,
    PermissionLoggingInterceptor,
    JwtModule,
    MailService,
  ],
})
export class AuthModule {}
