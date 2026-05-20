"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = __importStar(require("bcrypt"));
const typeorm_2 = require("typeorm");
const enums_1 = require("../common/enums");
const permisos_ui_interface_1 = require("../common/interfaces/permisos-ui.interface");
const sucursal_entity_1 = require("../entities/sucursal.entity");
const usuario_entity_1 = require("../entities/usuario.entity");
const activo_entity_1 = require("../entities/activo.entity");
const orden_trabajo_entity_1 = require("../entities/orden-trabajo.entity");
const DEMO_PASSWORD = 'Admin123!';
let SeedService = SeedService_1 = class SeedService {
    sucursalRepo;
    usuarioRepo;
    activoRepo;
    ordenRepo;
    logger = new common_1.Logger(SeedService_1.name);
    constructor(sucursalRepo, usuarioRepo, activoRepo, ordenRepo) {
        this.sucursalRepo = sucursalRepo;
        this.usuarioRepo = usuarioRepo;
        this.activoRepo = activoRepo;
        this.ordenRepo = ordenRepo;
    }
    async onModuleInit() {
        const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
        const ordenCount = await this.ordenRepo.count();
        const florida = await this.upsertSucursal('Sede La Florida', 'Av. Vicuña Mackenna 6100', 'La Florida', 'Santiago');
        const condes = await this.upsertSucursal('Sede Las Condes', 'Av. Apoquindo 4500', 'Las Condes', 'Santiago');
        const central = await this.upsertSucursal('Sucursal Central', 'Av. Principal 100', 'Santiago', 'Santiago');
        const sucursalMap = {
            florida: florida.id,
            condes: condes.id,
            central: central.id,
        };
        const users = [
            {
                email: 'admin@mindfit.cl',
                nombre: 'Super Admin Mindfit',
                rol: enums_1.RolUsuario.ADMIN,
                sucursalKey: 'central',
            },
            {
                email: 'jefe.ops@mindfit.cl',
                nombre: 'Jefe de Operaciones',
                rol: enums_1.RolUsuario.JEFE_OPERACIONES,
                sucursalKey: 'central',
            },
            {
                email: 'tecnico@mindfit.cl',
                nombre: 'Técnico de Campo',
                rol: enums_1.RolUsuario.TECNICO,
                sucursalKey: 'florida',
            },
            {
                email: 'jefe.florida@mindfit.cl',
                nombre: 'Jefe Sucursal La Florida',
                rol: enums_1.RolUsuario.JEFE_SUCURSAL,
                sucursalKey: 'florida',
            },
            {
                email: 'jefe.condes@mindfit.cl',
                nombre: 'Jefe Sucursal Las Condes',
                rol: enums_1.RolUsuario.JEFE_SUCURSAL,
                sucursalKey: 'condes',
            },
            {
                email: 'gerente@mindfit.cl',
                nombre: 'Ejecutivo Gerencia BI',
                rol: enums_1.RolUsuario.GERENTE_BI,
                sucursalKey: 'central',
            },
        ];
        const savedUsers = {};
        for (const u of users) {
            let usuario = await this.usuarioRepo.findOne({
                where: { email: u.email },
            });
            if (!usuario) {
                usuario = await this.usuarioRepo.save(this.usuarioRepo.create({
                    email: u.email,
                    passwordHash,
                    nombre: u.nombre,
                    rol: u.rol,
                    sucursalId: u.sucursalKey
                        ? sucursalMap[u.sucursalKey]
                        : null,
                    estaActivo: true,
                    permisosUi: permisos_ui_interface_1.PERMISOS_BY_ROL[u.rol] ?? {},
                }));
            }
            savedUsers[u.email] = usuario;
        }
        const activosData = [
            {
                nombre: 'Cinta Correr Pro X500',
                marca: 'Technogym',
                modelo: 'X500',
                numeroSerie: 'TG-X500-001',
                categoria: enums_1.CategoriaActivo.CARDIO,
                sucursalId: florida.id,
                costo: '4500000',
            },
            {
                nombre: 'Press de Pierna',
                marca: 'Life Fitness',
                modelo: 'Axiom',
                numeroSerie: 'LF-PP-042',
                categoria: enums_1.CategoriaActivo.FUERZA,
                sucursalId: florida.id,
                costo: '3200000',
            },
            {
                nombre: 'Aire Acondicionado Central',
                marca: 'Carrier',
                modelo: '42QHC018',
                numeroSerie: 'CR-AC-018',
                categoria: enums_1.CategoriaActivo.CLIMATIZACION,
                sucursalId: condes.id,
                costo: '2800000',
            },
            {
                nombre: 'Bomba de Agua Piscina',
                marca: 'Pedrollo',
                modelo: 'PKm 60',
                numeroSerie: 'PD-BA-060',
                categoria: enums_1.CategoriaActivo.BOMBA_AGUA,
                sucursalId: condes.id,
                costo: '890000',
            },
        ];
        const activos = [];
        for (const a of activosData) {
            let activo = await this.activoRepo.findOne({
                where: { numeroSerie: a.numeroSerie },
            });
            if (!activo) {
                activo = this.activoRepo.create({
                    nombre: a.nombre,
                    marca: a.marca,
                    modelo: a.modelo,
                    numeroSerie: a.numeroSerie,
                    categoria: a.categoria,
                    sucursalId: a.sucursalId,
                    costoAdquisicion: a.costo,
                    documentacionUrls: [],
                    estadoOperacional: enums_1.EstadoOperacionalActivo.OPERATIVO,
                });
                activo = await this.activoRepo.save(activo);
            }
            activos.push(activo);
        }
        const tecnico = savedUsers['tecnico@mindfit.cl'];
        const jefeOps = savedUsers['jefe.ops@mindfit.cl'];
        const ordenesSeed = [
            {
                codigoOt: `OT-${new Date().getFullYear()}-00001`,
                activo: activos[0],
                sucursalId: florida.id,
                titulo: 'Mantenimiento cinta - ruido anómalo',
                prioridad: enums_1.PrioridadOrden.ALTA,
                estado: enums_1.EstadoOrdenTrabajo.ASIGNADA,
                asignadoAId: tecnico.id,
            },
            {
                codigoOt: `OT-${new Date().getFullYear()}-00002`,
                activo: activos[1],
                sucursalId: florida.id,
                titulo: 'Revisión press de pierna',
                prioridad: enums_1.PrioridadOrden.MEDIA,
                estado: enums_1.EstadoOrdenTrabajo.EN_PROCESO,
                asignadoAId: tecnico.id,
                fechaInicioReal: new Date(Date.now() - 45 * 60000),
            },
            {
                codigoOt: `OT-${new Date().getFullYear()}-00003`,
                activo: activos[2],
                sucursalId: condes.id,
                titulo: 'Falla climatización zona cardio',
                prioridad: enums_1.PrioridadOrden.ALTA,
                estado: enums_1.EstadoOrdenTrabajo.PENDIENTE,
                asignadoAId: null,
            },
        ];
        if (ordenCount === 0) {
            for (const o of ordenesSeed) {
                await this.ordenRepo.save(this.ordenRepo.create({
                    codigoOt: o.codigoOt,
                    activoId: o.activo.id,
                    sucursalId: o.sucursalId,
                    creadoPorId: jefeOps.id,
                    asignadoAId: o.asignadoAId,
                    titulo: o.titulo,
                    descripcion: o.titulo,
                    prioridad: o.prioridad,
                    tipoMantenimiento: enums_1.TipoMantenimiento.CORRECTIVO,
                    estado: o.estado,
                    fechaInicioReal: o.fechaInicioReal ?? null,
                }));
            }
        }
        this.logger.log('Seed / usuarios demo Mindfit Ops:');
        this.logger.log('  admin@mindfit.cl (Super Admin)');
        this.logger.log('  jefe.ops@mindfit.cl (Jefe Operaciones)');
        this.logger.log('  tecnico@mindfit.cl (Técnico)');
        this.logger.log('  jefe.florida@mindfit.cl / jefe.condes@mindfit.cl');
        this.logger.log('  gerente@mindfit.cl (Ejecutivo BI)');
        this.logger.log(`  Contraseña demo: ${DEMO_PASSWORD}`);
    }
    async upsertSucursal(nombre, direccion, comuna, ciudad) {
        let sucursal = await this.sucursalRepo.findOne({ where: { nombre } });
        if (!sucursal) {
            sucursal = await this.sucursalRepo.save(this.sucursalRepo.create({
                nombre,
                direccion,
                comuna,
                ciudad,
                estaActiva: true,
            }));
        }
        return sucursal;
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sucursal_entity_1.Sucursal)),
    __param(1, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __param(2, (0, typeorm_1.InjectRepository)(activo_entity_1.Activo)),
    __param(3, (0, typeorm_1.InjectRepository)(orden_trabajo_entity_1.OrdenTrabajo)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeedService);
//# sourceMappingURL=seed.service.js.map