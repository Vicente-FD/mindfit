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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuariosService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const usuario_entity_1 = require("../entities/usuario.entity");
const transaction_context_service_1 = require("../common/database/transaction-context.service");
const permisos_ui_interface_1 = require("../common/interfaces/permisos-ui.interface");
let UsuariosService = class UsuariosService {
    dataSource;
    transactionContext;
    constructor(dataSource, transactionContext) {
        this.dataSource = dataSource;
        this.transactionContext = transactionContext;
    }
    async invalidateTokens(userId) {
        await this.repo().increment({ id: userId }, 'tokenVersion', 1);
    }
    repo() {
        return this.transactionContext.getRepository(usuario_entity_1.Usuario, this.dataSource);
    }
    findAll() {
        return this.repo()
            .createQueryBuilder('u')
            .leftJoinAndSelect('u.sucursal', 'sucursal')
            .where('u.deleted_at IS NULL')
            .orderBy('u.nombre', 'ASC')
            .select([
            'u.id',
            'u.email',
            'u.nombre',
            'u.rol',
            'u.sucursalId',
            'u.telefono',
            'u.estaActivo',
            'u.permisosUi',
            'u.estadoSesion',
            'u.createdAt',
            'u.updatedAt',
            'sucursal',
        ])
            .getMany();
    }
    async findOne(id) {
        const usuario = await this.repo().findOne({
            where: { id },
            relations: { sucursal: true },
            select: {
                id: true,
                email: true,
                nombre: true,
                rol: true,
                sucursalId: true,
                telefono: true,
                estaActivo: true,
                permisosUi: true,
                estadoSesion: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!usuario) {
            throw new common_1.NotFoundException(`Usuario ${id} no encontrado`);
        }
        return usuario;
    }
    async create(dto) {
        const exists = await this.repo().findOne({
            where: { email: dto.email.toLowerCase() },
        });
        if (exists) {
            throw new common_1.ConflictException('El email ya está registrado');
        }
        if (dto.rol === enums_1.RolUsuario.JEFE_SUCURSAL && !dto.sucursalId) {
            throw new common_1.BadRequestException('Jefe de sucursal requiere una sede asignada');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const usuario = this.repo().create({
            email: dto.email.toLowerCase(),
            passwordHash,
            nombre: dto.nombre,
            rol: dto.rol,
            sucursalId: dto.sucursalId ?? null,
            telefono: dto.telefono ?? null,
            estaActivo: dto.estaActivo ?? true,
            permisosUi: dto.permisosUi ??
                permisos_ui_interface_1.PERMISOS_BY_ROL[dto.rol] ??
                permisos_ui_interface_1.PERMISOS_UI_DEFAULT,
        });
        const saved = await this.repo().save(usuario);
        return this.findOne(saved.id);
    }
    async update(id, dto) {
        const usuario = await this.repo().findOne({ where: { id } });
        if (!usuario) {
            throw new common_1.NotFoundException(`Usuario ${id} no encontrado`);
        }
        if (dto.email) {
            dto.email = dto.email.toLowerCase();
            if (dto.email !== usuario.email) {
                const exists = await this.repo().findOne({
                    where: { email: dto.email },
                });
                if (exists) {
                    throw new common_1.ConflictException('El email ya está registrado');
                }
            }
        }
        const rol = dto.rol ?? usuario.rol;
        const sucursalId = dto.sucursalId !== undefined ? dto.sucursalId : usuario.sucursalId;
        if (rol === enums_1.RolUsuario.JEFE_SUCURSAL && !sucursalId) {
            throw new common_1.BadRequestException('Jefe de sucursal requiere una sede asignada');
        }
        if (dto.rol !== undefined || dto.sucursalId !== undefined) {
            usuario.sucursalId = sucursalId ?? null;
        }
        const { sucursalId: _omit, ...rest } = dto;
        Object.assign(usuario, rest);
        if (dto.estaActivo === false) {
            await this.invalidateTokens(id);
            usuario.estadoSesion = enums_1.EstadoSesionUsuario.DESCONECTADO;
        }
        await this.repo().save(usuario);
        return this.findOne(id);
    }
    async updatePassword(id, dto) {
        const usuario = await this.repo().findOne({ where: { id } });
        if (!usuario) {
            throw new common_1.NotFoundException(`Usuario ${id} no encontrado`);
        }
        usuario.passwordHash = await bcrypt.hash(dto.password, 12);
        await this.repo().save(usuario);
        return { updated: true };
    }
    async remove(id) {
        const usuario = await this.findOne(id);
        usuario.estaActivo = false;
        await this.invalidateTokens(id);
        await this.repo().save(usuario);
        await this.repo().softDelete(id);
        return { deleted: true };
    }
};
exports.UsuariosService = UsuariosService;
exports.UsuariosService = UsuariosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        transaction_context_service_1.TransactionContextService])
], UsuariosService);
//# sourceMappingURL=usuarios.service.js.map