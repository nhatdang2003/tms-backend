import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler'
import { AppController } from './app.controller'
import { RolesModule } from './roles/roles.module'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { GlobalResponseInterceptor } from './common/interceptors/global-response.interceptor'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { TerminusModule } from '@nestjs/terminus'
import { HttpModule } from '@nestjs/axios'
import { OrganizationsModule } from './organizations/organizations.module'
import { PermissionsModule } from './permissions/permissions.module'
import { DocumentsModule } from './documents/documents.module'
import { TicketsModule } from './tickets/tickets.module'
import { addTransactionalDataSource } from 'typeorm-transactional'
import { DataSource } from 'typeorm'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'dev'}`, '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        autoLoadEntities: true,
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        seeds: [__dirname + '/seeds/**/*{.ts,.js}'],
        cli: {
          migrationsDir: __dirname + '/migrations/',
        },
        logging: configService.get<string>('NODE_ENV') === 'dev' ? ['query', 'error'] : false,
      }),
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed')
        }
        return addTransactionalDataSource(new DataSource(options))
      },
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            ttl: configService.get<number>('THROTTLE_TTL', 1000),
            limit: configService.get<number>('THROTTLE_LIMIT', 500),
          },
        ],
      }),
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    RolesModule,
    OrganizationsModule,
    PermissionsModule,
    DocumentsModule,
    TicketsModule,
    TerminusModule,
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
