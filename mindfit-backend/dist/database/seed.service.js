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
const marca_entity_1 = require("../entities/marca.entity");
const categoria_entity_1 = require("../entities/categoria.entity");
const repuesto_entity_1 = require("../entities/repuesto.entity");
const bodega_stock_entity_1 = require("../entities/bodega-stock.entity");
const DEMO_PASSWORD = 'Admin123!';
let SeedService = SeedService_1 = class SeedService {
    sucursalRepo;
    usuarioRepo;
    activoRepo;
    ordenRepo;
    marcaRepo;
    categoriaRepo;
    repuestoRepo;
    bodegaStockRepo;
    logger = new common_1.Logger(SeedService_1.name);
    constructor(sucursalRepo, usuarioRepo, activoRepo, ordenRepo, marcaRepo, categoriaRepo, repuestoRepo, bodegaStockRepo) {
        this.sucursalRepo = sucursalRepo;
        this.usuarioRepo = usuarioRepo;
        this.activoRepo = activoRepo;
        this.ordenRepo = ordenRepo;
        this.marcaRepo = marcaRepo;
        this.categoriaRepo = categoriaRepo;
        this.repuestoRepo = repuestoRepo;
        this.bodegaStockRepo = bodegaStockRepo;
    }
    async onModuleInit() {
        const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
        const ordenCount = await this.ordenRepo.count();
        await this.seedMarcas();
        const florida = await this.upsertSucursal('Sede La Florida', 'LF', 'Av. Vicuña Mackenna 6100', 'La Florida', 'Santiago');
        const condes = await this.upsertSucursal('Sede Las Condes', 'LC', 'Av. Apoquindo 4500', 'Las Condes', 'Santiago', 3);
        await this.upsertSucursal('Sede Viña del Mar', 'VM', 'Av. Libertad 1340', 'Viña del Mar', 'Valparaíso');
        const sucursalMap = {
            florida: florida.id,
            condes: condes.id,
        };
        const users = [
            {
                email: 'admin@mindfit.cl',
                nombre: 'Super Admin Mindfit',
                rol: enums_1.RolUsuario.ADMIN,
                sucursalKey: null,
            },
            {
                email: 'jefe.ops@mindfit.cl',
                nombre: 'Jefe de Operaciones',
                rol: enums_1.RolUsuario.JEFE_OPERACIONES,
                sucursalKey: null,
            },
            {
                email: 'tecnico@mindfit.cl',
                nombre: 'Técnico de Campo',
                rol: enums_1.RolUsuario.TECNICO,
                sucursalKey: null,
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
                sucursalKey: null,
            },
            {
                email: 'bodeguero@mindfit.cl',
                nombre: 'Bodeguero Central',
                rol: enums_1.RolUsuario.BODEGUERO,
                sucursalKey: null,
            },
        ];
        const savedUsers = {};
        for (const u of users) {
            let usuario = await this.usuarioRepo.findOne({
                where: { email: u.email },
            });
            const sucursalId = u.sucursalKey != null ? sucursalMap[u.sucursalKey] : null;
            if (!usuario) {
                usuario = await this.usuarioRepo.save(this.usuarioRepo.create({
                    email: u.email,
                    passwordHash,
                    nombre: u.nombre,
                    rol: u.rol,
                    sucursalId,
                    estaActivo: true,
                    estadoSesion: enums_1.EstadoSesionUsuario.DESCONECTADO,
                    permisosUi: permisos_ui_interface_1.PERMISOS_BY_ROL[u.rol] ?? {},
                }));
            }
            else {
                if (u.sucursalKey === null && u.rol !== enums_1.RolUsuario.JEFE_SUCURSAL) {
                    usuario.sucursalId = null;
                }
                await this.usuarioRepo.save(usuario);
            }
            savedUsers[u.email] = usuario;
        }
        const matrix = await this.marcaRepo.findOne({ where: { sigla: 'MX' } });
        const life = await this.marcaRepo.findOne({ where: { sigla: 'LF' } });
        const carrier = await this.marcaRepo.findOne({ where: { sigla: 'CR' } });
        const pedrollo = await this.marcaRepo.findOne({ where: { sigla: 'PD' } });
        const catCardio = await this.categoriaRepo.findOne({ where: { sigla: 'CR' } });
        const catFuerza = await this.categoriaRepo.findOne({ where: { sigla: 'FZ' } });
        const catClima = await this.categoriaRepo.findOne({ where: { sigla: 'CL' } });
        const catBomba = await this.categoriaRepo.findOne({ where: { sigla: 'BA' } });
        const activosData = [
            {
                nombre: 'Cinta Correr Pro X500',
                marcaId: matrix?.id,
                marca: 'Matrix',
                modelo: 'X500',
                codigo: 'LF-MX-25-CR-01',
                categoria: enums_1.CategoriaActivo.CARDIO,
                categoriaId: catCardio?.id,
                sucursalId: florida.id,
                pisoAsignado: null,
                costo: '4500000',
                fechaCompra: '2025-01-15',
            },
            {
                nombre: 'Press de Pierna',
                marcaId: life?.id,
                marca: 'Life Fitness',
                modelo: 'Axiom',
                codigo: 'LF-LF-25-FZ-01',
                categoria: enums_1.CategoriaActivo.FUERZA,
                categoriaId: catFuerza?.id,
                sucursalId: florida.id,
                pisoAsignado: null,
                costo: '3200000',
                fechaCompra: '2025-03-10',
            },
            {
                nombre: 'Aire Acondicionado Central',
                marcaId: carrier?.id,
                marca: 'Carrier',
                modelo: '42QHC018',
                codigo: 'LC-CR-24-CL-01',
                categoria: enums_1.CategoriaActivo.CLIMATIZACION,
                categoriaId: catClima?.id,
                sucursalId: condes.id,
                pisoAsignado: 2,
                costo: '2800000',
                fechaCompra: '2024-06-01',
            },
            {
                nombre: 'Bomba de Agua Piscina',
                marcaId: pedrollo?.id,
                marca: 'Pedrollo',
                modelo: 'PKm 60',
                codigo: 'LC-PD-24-BA-01',
                categoria: enums_1.CategoriaActivo.BOMBA_AGUA,
                categoriaId: catBomba?.id,
                sucursalId: condes.id,
                pisoAsignado: 1,
                costo: '890000',
                fechaCompra: '2024-08-20',
            },
        ];
        const activos = [];
        for (const a of activosData) {
            let activo = await this.activoRepo.findOne({
                where: { codigoInventario: a.codigo },
            });
            if (!activo) {
                activo = this.activoRepo.create({
                    nombre: a.nombre,
                    marcaId: a.marcaId ?? null,
                    marca: a.marca,
                    modelo: a.modelo,
                    codigoInventario: a.codigo,
                    codigoQrToken: a.codigo,
                    categoria: a.categoria,
                    categoriaId: a.categoriaId ?? null,
                    pisoAsignado: a.pisoAsignado ?? null,
                    sucursalId: a.sucursalId,
                    fechaCompra: a.fechaCompra,
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
        await this.seedInventario();
        this.logger.log('Seed Mindfit Ops listo (marcas, siglas, usuarios demo)');
        this.logger.log(`  Contraseña demo: ${DEMO_PASSWORD}`);
    }
    async seedInventario() {
        const catalogo = [
            {
                sku: 'MF-BELT-001',
                nombre: 'Correa transmisión cinta',
                costo: 45000,
                stock: 12,
                min: 5,
            },
            {
                sku: 'MF-LUBE-002',
                nombre: 'Lubricante cadena 500ml',
                costo: 8900,
                stock: 30,
                min: 10,
            },
            {
                sku: 'MF-ELEC-003',
                nombre: 'Fusible industrial 25A',
                costo: 3200,
                stock: 8,
                min: 5,
            },
        ];
        for (const item of catalogo) {
            let repuesto = await this.repuestoRepo.findOne({
                where: { sku: item.sku },
            });
            if (!repuesto) {
                repuesto = await this.repuestoRepo.save(this.repuestoRepo.create({
                    sku: item.sku,
                    nombre: item.nombre,
                    descripcion: `Insumo demo ${item.sku}`,
                    costoUnitario: String(item.costo),
                }));
            }
            const exists = await this.bodegaStockRepo.findOne({
                where: { repuestoId: repuesto.id },
            });
            if (!exists) {
                await this.bodegaStockRepo.save(this.bodegaStockRepo.create({
                    repuestoId: repuesto.id,
                    cantidadActual: item.stock,
                    cantidadMinimaAlerta: item.min,
                }));
            }
        }
    }
    async seedMarcas() {
        const marcas = [
            { nombre: 'Matrix', sigla: 'MX' },
            { nombre: 'Life Fitness', sigla: 'LF' },
            { nombre: 'Precor', sigla: 'PR' },
            { nombre: 'Technogym', sigla: 'TG' },
            { nombre: 'Carrier', sigla: 'CR' },
            { nombre: 'Pedrollo', sigla: 'PD' },
        ];
        for (const m of marcas) {
            const exists = await this.marcaRepo.findOne({
                where: [{ nombre: m.nombre }, { sigla: m.sigla }],
            });
            if (!exists) {
                await this.marcaRepo.save(this.marcaRepo.create(m));
            }
        }
    }
    async upsertSucursal(nombre, sigla, direccion, comuna, ciudad, cantidadPisos = 1) {
        let sucursal = await this.sucursalRepo.findOne({ where: { nombre } });
        if (!sucursal) {
            sucursal = await this.sucursalRepo.save(this.sucursalRepo.create({
                nombre,
                sigla,
                direccion,
                comuna,
                ciudad,
                estaActiva: true,
                cantidadPisos,
            }));
        }
        else {
            if (!sucursal.sigla)
                sucursal.sigla = sigla;
            if (cantidadPisos > 1)
                sucursal.cantidadPisos = cantidadPisos;
            sucursal = await this.sucursalRepo.save(sucursal);
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
    __param(4, (0, typeorm_1.InjectRepository)(marca_entity_1.Marca)),
    __param(5, (0, typeorm_1.InjectRepository)(categoria_entity_1.Categoria)),
    __param(6, (0, typeorm_1.InjectRepository)(repuesto_entity_1.Repuesto)),
    __param(7, (0, typeorm_1.InjectRepository)(bodega_stock_entity_1.BodegaStock)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeedService);
//# sourceMappingURL=seed.service.js.map