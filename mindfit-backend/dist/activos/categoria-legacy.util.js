"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIGLA_TO_CATEGORIA_ENUM = void 0;
exports.categoriaEnumFromSigla = categoriaEnumFromSigla;
const enums_1 = require("../common/enums");
exports.SIGLA_TO_CATEGORIA_ENUM = {
    CR: enums_1.CategoriaActivo.CARDIO,
    FZ: enums_1.CategoriaActivo.FUERZA,
    CL: enums_1.CategoriaActivo.CLIMATIZACION,
    IF: enums_1.CategoriaActivo.INFRAESTRUCTURA,
    BA: enums_1.CategoriaActivo.BOMBA_AGUA,
};
function categoriaEnumFromSigla(sigla) {
    return exports.SIGLA_TO_CATEGORIA_ENUM[sigla.toUpperCase()] ?? null;
}
//# sourceMappingURL=categoria-legacy.util.js.map