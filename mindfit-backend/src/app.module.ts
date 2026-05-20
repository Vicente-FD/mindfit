import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuditContextInterceptor } from './common/interceptors/audit-context.interceptor';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { SeedService } from './database/seed.service';
import {
  Activo,
  AuditTrail,
  ComentarioOt,
  EvidenciaOt,
  OrdenTrabajo,
  Sucursal,
  Usuario,
} from './entities';
import { SucursalesModule } from './sucursales/sucursales.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ActivosModule } from './activos/activos.module';
import { OrdenesTrabajoModule } from './ordenes-trabajo/ordenes-trabajo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', '127.0.0.1'),
        port: configService.get<number>('DB_PORT', 5432),
        username:
          configService.get<string>('DB_USER') ??
          configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database:
          configService.get<string>('DB_NAME') ??
          configService.get<string>('DB_DATABASE', 'mindfit_ops'),
        entities: [
          Sucursal,
          Usuario,
          Activo,
          OrdenTrabajo,
          EvidenciaOt,
          ComentarioOt,
          AuditTrail,
        ],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        retryAttempts: 10,
        retryDelay: 3000,
        keepConnectionAlive: true,
      }),
    }),
    TypeOrmModule.forFeature([Sucursal, Usuario]),
    CommonModule,
    DatabaseModule,
    AuthModule,
    SucursalesModule,
    UsuariosModule,
    ActivosModule,
    OrdenesTrabajoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SeedService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditContextInterceptor,
    },
  ],
})
export class AppModule {}
