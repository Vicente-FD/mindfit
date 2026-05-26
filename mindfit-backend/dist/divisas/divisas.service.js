"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DivisasService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DivisasService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const enums_1 = require("../common/enums");
const USD_POR_CAD = 1.36;
let DivisasService = DivisasService_1 = class DivisasService {
    logger = new common_1.Logger(DivisasService_1.name);
    cache = null;
    cacheAt = 0;
    ttlMs = 12 * 60 * 60 * 1000;
    async refrescarCacheDiario() {
        try {
            await this.fetchTasas(true);
            this.logger.log('Tasas de cambio actualizadas (cron diario)');
        }
        catch (err) {
            this.logger.warn(`No se pudo refrescar tasas: ${String(err)}`);
        }
    }
    async getTasas() {
        if (this.cache && Date.now() - this.cacheAt < this.ttlMs) {
            return this.cache;
        }
        return this.fetchTasas(false);
    }
    async fetchTasas(force) {
        if (!force && this.cache && Date.now() - this.cacheAt < this.ttlMs) {
            return this.cache;
        }
        const res = await fetch('https://mindicador.cl/api', {
            headers: { Accept: 'application/json' },
        });
        if (!res.ok) {
            if (this.cache)
                return this.cache;
            throw new Error(`mindicador.cl respondió ${res.status}`);
        }
        const data = (await res.json());
        const usd = data.dolar?.valor;
        const eur = data.euro?.valor;
        if (usd == null || eur == null || !Number.isFinite(usd) || !Number.isFinite(eur)) {
            if (this.cache)
                return this.cache;
            throw new Error('Respuesta incompleta de mindicador.cl');
        }
        const cad = usd / USD_POR_CAD;
        const tasas = {
            CLP: 1,
            USD: usd,
            EUR: eur,
            CAD: Math.round(cad * 100) / 100,
            fechaReferencia: data.dolar?.fecha ?? data.fecha ?? new Date().toISOString(),
            fuente: 'mindicador.cl',
        };
        this.cache = tasas;
        this.cacheAt = Date.now();
        return tasas;
    }
    tasaParaDivisa(tasas, divisa) {
        switch (divisa) {
            case enums_1.DivisaCodigo.USD:
                return tasas.USD;
            case enums_1.DivisaCodigo.EUR:
                return tasas.EUR;
            case enums_1.DivisaCodigo.CAD:
                return tasas.CAD;
            default:
                return 1;
        }
    }
};
exports.DivisasService = DivisasService;
__decorate([
    (0, schedule_1.Cron)('0 8 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DivisasService.prototype, "refrescarCacheDiario", null);
exports.DivisasService = DivisasService = DivisasService_1 = __decorate([
    (0, common_1.Injectable)()
], DivisasService);
//# sourceMappingURL=divisas.service.js.map