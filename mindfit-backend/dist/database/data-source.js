"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const typeorm_1 = require("typeorm");
const entities_1 = require("../entities");
const _1730000000000_AuditTrigger_1 = require("./migrations/1730000000000-AuditTrigger");
(0, dotenv_1.config)({ path: '.env' });
exports.default = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? process.env.DB_DATABASE ?? 'mindfit_ops',
    entities: [
        entities_1.Sucursal,
        entities_1.Usuario,
        entities_1.Activo,
        entities_1.OrdenTrabajo,
        entities_1.EvidenciaOt,
        entities_1.ComentarioOt,
        entities_1.AuditTrail,
    ],
    migrations: [_1730000000000_AuditTrigger_1.AuditTrigger1730000000000],
    synchronize: false,
});
//# sourceMappingURL=data-source.js.map