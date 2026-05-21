import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DebugController } from './common/debug.controller';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { SeedService } from './database/seed.service';
import { SchemaFixService } from './database/schema-fix.service';
import {
  Activo,
  AuditTrail,
  ComentarioOt,
  EvidenciaOt,
  Marca,
  OrdenTrabajo,
  PlanPreventivo,
  Repuesto,
  BodegaStock,
  OrdenTrabajoRepuesto,
  Sucursal,
  Usuario,
} from './entities';
import { InventarioModule } from './inventario/inventario.module';
import { AuditTrailModule } from './audit-trail/audit-trail.module';
import { PlanesPreventivosModule } from './planes-preventivos/planes-preventivos.module';
import { MarcasModule } from './marcas/marcas.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ActivosModule } from './activos/activos.module';
import { OrdenesTrabajoModule } from './ordenes-trabajo/ordenes-trabajo.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { runBodegaGlobalPreMigrate } from './database/bodega-global-migrate';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        await runBodegaGlobalPreMigrate({
          host: configService.get<string>('DB_HOST', '127.0.0.1'),
          port: configService.get<number>('DB_PORT', 5432),
          user:
            configService.get<string>('DB_USER') ??
            configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', ''),
          database:
            configService.get<string>('DB_NAME') ??
            configService.get<string>('DB_DATABASE', 'mindfit_ops'),
        });

        return {
          type: 'postgres' as const,
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
            Marca,
            Activo,
            OrdenTrabajo,
            EvidenciaOt,
            ComentarioOt,
            AuditTrail,
            PlanPreventivo,
            Repuesto,
            BodegaStock,
            OrdenTrabajoRepuesto,
          ],
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
          retryAttempts: 10,
          retryDelay: 3000,
          keepConnectionAlive: true,
        };
      },
    }),
    TypeOrmModule.forFeature([
      Sucursal,
      Usuario,
      Marca,
      Activo,
      OrdenTrabajo,
      Repuesto,
      BodegaStock,
    ]),
    CommonModule,
    DatabaseModule,
    AuthModule,
    SucursalesModule,
    UsuariosModule,
    ActivosModule,
    MarcasModule,
    OrdenesTrabajoModule,
    AnalyticsModule,
    PlanesPreventivosModule,
    AuditTrailModule,
    InventarioModule,
  ],
  controllers: [AppController, DebugController],
  providers: [
    AppService,
    SchemaFixService,
    SeedService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
