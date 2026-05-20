"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const audit_context_interceptor_1 = require("./common/interceptors/audit-context.interceptor");
const common_module_1 = require("./common/common.module");
const database_module_1 = require("./database/database.module");
const seed_service_1 = require("./database/seed.service");
const entities_1 = require("./entities");
const sucursales_module_1 = require("./sucursales/sucursales.module");
const usuarios_module_1 = require("./usuarios/usuarios.module");
const activos_module_1 = require("./activos/activos.module");
const ordenes_trabajo_module_1 = require("./ordenes-trabajo/ordenes-trabajo.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', '127.0.0.1'),
                    port: configService.get('DB_PORT', 5432),
                    username: configService.get('DB_USER') ??
                        configService.get('DB_USERNAME', 'postgres'),
                    password: configService.get('DB_PASSWORD', ''),
                    database: configService.get('DB_NAME') ??
                        configService.get('DB_DATABASE', 'mindfit_ops'),
                    entities: [
                        entities_1.Sucursal,
                        entities_1.Usuario,
                        entities_1.Activo,
                        entities_1.OrdenTrabajo,
                        entities_1.EvidenciaOt,
                        entities_1.ComentarioOt,
                        entities_1.AuditTrail,
                    ],
                    synchronize: configService.get('NODE_ENV') !== 'production',
                    retryAttempts: 10,
                    retryDelay: 3000,
                    keepConnectionAlive: true,
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature([entities_1.Sucursal, entities_1.Usuario]),
            common_module_1.CommonModule,
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            sucursales_module_1.SucursalesModule,
            usuarios_module_1.UsuariosModule,
            activos_module_1.ActivosModule,
            ordenes_trabajo_module_1.OrdenesTrabajoModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            seed_service_1.SeedService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: audit_context_interceptor_1.AuditContextInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map