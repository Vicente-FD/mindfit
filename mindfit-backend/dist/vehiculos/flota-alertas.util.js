"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KM_ALERTA_ACEITE = exports.DIAS_ALERTA_VENCIMIENTO = void 0;
exports.diasHastaVencimiento = diasHastaVencimiento;
exports.alertaPorFecha = alertaPorFecha;
exports.alertaPorAceite = alertaPorAceite;
exports.calcularAlertasVehiculo = calcularAlertasVehiculo;
exports.vehiculoRequiereAtencion = vehiculoRequiereAtencion;
exports.DIAS_ALERTA_VENCIMIENTO = 30;
exports.KM_ALERTA_ACEITE = 1000;
function diasHastaVencimiento(fecha) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const f = new Date(fecha);
    f.setHours(0, 0, 0, 0);
    return Math.ceil((f.getTime() - hoy.getTime()) / 86_400_000);
}
function alertaPorFecha(fecha) {
    return diasHastaVencimiento(fecha) <= exports.DIAS_ALERTA_VENCIMIENTO;
}
function alertaPorAceite(v) {
    return v.siguienteCambioAceiteKm - v.kilometrajeActual <= exports.KM_ALERTA_ACEITE;
}
function calcularAlertasVehiculo(v) {
    return {
        soap: alertaPorFecha(v.vencimientoSoap),
        permiso: alertaPorFecha(v.vencimientoPermiso),
        revision: alertaPorFecha(v.vencimientoRevision),
        aceite: alertaPorAceite(v),
    };
}
function vehiculoRequiereAtencion(v) {
    const a = calcularAlertasVehiculo(v);
    return a.soap || a.permiso || a.revision || a.aceite;
}
//# sourceMappingURL=flota-alertas.util.js.map