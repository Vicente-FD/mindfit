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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = __importStar(require("bcrypt"));
const typeorm_2 = require("typeorm");
const enums_1 = require("../common/enums");
const audit_trail_entity_1 = require("../entities/audit-trail.entity");
const permisos_ui_interface_1 = require("../common/interfaces/permisos-ui.interface");
const usuario_entity_1 = require("../entities/usuario.entity");
let AuthService = class AuthService {
    usuarioRepository;
    jwtService;
    dataSource;
    constructor(usuarioRepository, jwtService, dataSource) {
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
        this.dataSource = dataSource;
    }
    async login(dto) {
        const usuario = await this.usuarioRepository.findOne({
            where: { email: dto.email.toLowerCase() },
            relations: { sucursal: true },
        });
        if (!usuario || !usuario.estaActivo) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const passwordValid = await bcrypt.compare(dto.password, usuario.passwordHash);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        usuario.estadoSesion = enums_1.EstadoSesionUsuario.CONECTADO;
        await this.usuarioRepository.save(usuario);
        return {
            accessToken: await this.signToken(usuario),
            user: this.toAuthUser(usuario),
        };
    }
    async getSessionProfile(userId) {
        const usuario = await this.usuarioRepository.findOne({
            where: { id: userId },
            relations: { sucursal: true },
        });
        if (!usuario || !usuario.estaActivo) {
            throw new common_1.UnauthorizedException('Sesión finalizada');
        }
        return {
            user: this.toAuthUser(usuario),
            forceLogout: false,
        };
    }
    async logout(userId) {
        await this.setEstadoSesion(userId, enums_1.EstadoSesionUsuario.DESCONECTADO);
        return { ok: true };
    }
    async updateSesion(userId, estado) {
        const usuario = await this.usuarioRepository.findOne({
            where: { id: userId },
            relations: { sucursal: true },
        });
        if (!usuario || !usuario.estaActivo) {
            throw new common_1.UnauthorizedException('Sesión finalizada');
        }
        usuario.estadoSesion = estado;
        await this.usuarioRepository.save(usuario);
        return {
            user: this.toAuthUser(usuario),
            forceLogout: false,
        };
    }
    async invalidateTokens(userId) {
        await this.usuarioRepository.increment({ id: userId }, 'tokenVersion', 1);
    }
    async cambiarPasswordPerfil(userId, dto) {
        return this.dataSource.transaction(async (manager) => {
            const usuario = await manager.findOne(usuario_entity_1.Usuario, {
                where: { id: userId },
                relations: { sucursal: true },
            });
            if (!usuario || !usuario.estaActivo) {
                throw new common_1.UnauthorizedException('Sesión finalizada');
            }
            const passwordValid = await bcrypt.compare(dto.passwordActual, usuario.passwordHash);
            if (!passwordValid) {
                throw new common_1.UnauthorizedException('La contraseña actual es incorrecta');
            }
            if (dto.passwordActual === dto.nuevoPassword) {
                throw new common_1.BadRequestException('La nueva contraseña debe ser distinta a la actual');
            }
            const tokenVersionAnterior = usuario.tokenVersion ?? 0;
            const requiereCambioAnterior = usuario.requiereCambioPassword ?? false;
            usuario.passwordHash = await bcrypt.hash(dto.nuevoPassword, 10);
            usuario.requiereCambioPassword = false;
            usuario.tokenVersion = tokenVersionAnterior + 1;
            await manager.save(usuario);
            await manager.getRepository(audit_trail_entity_1.AuditTrail).save({
                tableName: 'usuarios',
                rowPk: String(usuario.id),
                operation: enums_1.OperacionAuditoria.UPDATE,
                userId: usuario.id,
                oldData: {
                    tokenVersion: tokenVersionAnterior,
                    requiereCambioPassword: requiereCambioAnterior,
                },
                newData: {
                    passwordChanged: true,
                    tokenVersion: usuario.tokenVersion,
                    requiereCambioPassword: false,
                },
            });
            const accessToken = await this.signToken(usuario);
            return {
                accessToken,
                user: this.toAuthUser(usuario),
                forceLogout: false,
            };
        });
    }
    async signToken(usuario) {
        return this.jwtService.signAsync({
            sub: usuario.id,
            email: usuario.email,
            rol: usuario.rol,
            tokenVersion: usuario.tokenVersion ?? 0,
        });
    }
    async setEstadoSesion(userId, estado) {
        const usuario = await this.usuarioRepository.findOne({
            where: { id: userId },
            relations: { sucursal: true },
        });
        if (!usuario) {
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        }
        usuario.estadoSesion = estado;
        return this.usuarioRepository.save(usuario);
    }
    resolvePermisos(usuario) {
        return (0, permisos_ui_interface_1.resolvePermisosUi)(usuario.rol, usuario.permisosUi);
    }
    toAuthUser(usuario) {
        return {
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre,
            rol: usuario.rol,
            sucursalId: usuario.sucursalId,
            sucursalNombre: usuario.sucursal?.nombre ?? null,
            telefono: usuario.telefono ?? null,
            estadoSesion: usuario.estadoSesion,
            permisosUi: this.resolvePermisos(usuario),
            requiereCambioPassword: usuario.requiereCambioPassword ?? false,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        typeorm_2.DataSource])
], AuthService);
//# sourceMappingURL=auth.service.js.map