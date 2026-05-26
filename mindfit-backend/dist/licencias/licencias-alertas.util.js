"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIAS_ALERTA_VENCIMIENTO = exports.diasHastaVencimiento = void 0;
exports.licenciaRequiereAtencion = licenciaRequiereAtencion;
const flota_alertas_util_1 = require("../vehiculos/flota-alertas.util");
Object.defineProperty(exports, "DIAS_ALERTA_VENCIMIENTO", { enumerable: true, get: function () { return flota_alertas_util_1.DIAS_ALERTA_VENCIMIENTO; } });
Object.defineProperty(exports, "diasHastaVencimiento", { enumerable: true, get: function () { return flota_alertas_util_1.diasHastaVencimiento; } });
function licenciaRequiereAtencion(fechaVencimiento) {
    return (0, flota_alertas_util_1.diasHastaVencimiento)(fechaVencimiento) <= flota_alertas_util_1.DIAS_ALERTA_VENCIMIENTO;
}
//# sourceMappingURL=licencias-alertas.util.js.map