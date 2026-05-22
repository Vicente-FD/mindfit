"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadoRendicionGasto = exports.TipoMovimientoInventario = exports.OperacionAuditoria = exports.TipoEvidencia = exports.ClasificacionOrden = exports.EstadoOrdenTrabajo = exports.TipoMantenimiento = exports.PrioridadOrden = exports.EstadoOperacionalActivo = exports.CategoriaActivo = exports.EstadoSesionUsuario = exports.RolUsuario = void 0;
var RolUsuario;
(function (RolUsuario) {
    RolUsuario["ADMIN"] = "admin";
    RolUsuario["JEFE_OPERACIONES"] = "jefe_operaciones";
    RolUsuario["TECNICO"] = "tecnico";
    RolUsuario["JEFE_SUCURSAL"] = "jefe_sucursal";
    RolUsuario["GERENTE_BI"] = "gerente_bi";
    RolUsuario["BODEGUERO"] = "bodeguero";
})(RolUsuario || (exports.RolUsuario = RolUsuario = {}));
var EstadoSesionUsuario;
(function (EstadoSesionUsuario) {
    EstadoSesionUsuario["CONECTADO"] = "conectado";
    EstadoSesionUsuario["DESCONECTADO"] = "desconectado";
    EstadoSesionUsuario["REPOSO"] = "reposo";
})(EstadoSesionUsuario || (exports.EstadoSesionUsuario = EstadoSesionUsuario = {}));
var CategoriaActivo;
(function (CategoriaActivo) {
    CategoriaActivo["CARDIO"] = "cardio";
    CategoriaActivo["FUERZA"] = "fuerza";
    CategoriaActivo["CLIMATIZACION"] = "climatizacion";
    CategoriaActivo["INFRAESTRUCTURA"] = "infraestructura";
    CategoriaActivo["BOMBA_AGUA"] = "bomba_agua";
})(CategoriaActivo || (exports.CategoriaActivo = CategoriaActivo = {}));
var EstadoOperacionalActivo;
(function (EstadoOperacionalActivo) {
    EstadoOperacionalActivo["OPERATIVO"] = "operativo";
    EstadoOperacionalActivo["FUERA_SERVICIO"] = "fuera_servicio";
    EstadoOperacionalActivo["MANTENIMIENTO_PREVENTIVO"] = "mantenimiento_preventivo";
    EstadoOperacionalActivo["EN_REPARACION"] = "en_reparacion";
})(EstadoOperacionalActivo || (exports.EstadoOperacionalActivo = EstadoOperacionalActivo = {}));
var PrioridadOrden;
(function (PrioridadOrden) {
    PrioridadOrden["BAJA"] = "baja";
    PrioridadOrden["MEDIA"] = "media";
    PrioridadOrden["ALTA"] = "alta";
})(PrioridadOrden || (exports.PrioridadOrden = PrioridadOrden = {}));
var TipoMantenimiento;
(function (TipoMantenimiento) {
    TipoMantenimiento["CORRECTIVO"] = "correctivo";
    TipoMantenimiento["PREVENTIVO"] = "preventivo";
})(TipoMantenimiento || (exports.TipoMantenimiento = TipoMantenimiento = {}));
var EstadoOrdenTrabajo;
(function (EstadoOrdenTrabajo) {
    EstadoOrdenTrabajo["PENDIENTE"] = "pendiente";
    EstadoOrdenTrabajo["ASIGNADA"] = "asignada";
    EstadoOrdenTrabajo["EN_PROCESO"] = "en_proceso";
    EstadoOrdenTrabajo["FINALIZADA"] = "finalizada";
    EstadoOrdenTrabajo["APROBADA"] = "aprobada";
    EstadoOrdenTrabajo["RECHAZADA"] = "rechazada";
})(EstadoOrdenTrabajo || (exports.EstadoOrdenTrabajo = EstadoOrdenTrabajo = {}));
var ClasificacionOrden;
(function (ClasificacionOrden) {
    ClasificacionOrden["MAQUINA"] = "maquina";
    ClasificacionOrden["INFRAESTRUCTURA"] = "infraestructura";
    ClasificacionOrden["PETICION"] = "peticion";
})(ClasificacionOrden || (exports.ClasificacionOrden = ClasificacionOrden = {}));
var TipoEvidencia;
(function (TipoEvidencia) {
    TipoEvidencia["ANTES"] = "antes";
    TipoEvidencia["DESPUES"] = "despues";
})(TipoEvidencia || (exports.TipoEvidencia = TipoEvidencia = {}));
var OperacionAuditoria;
(function (OperacionAuditoria) {
    OperacionAuditoria["INSERT"] = "INSERT";
    OperacionAuditoria["UPDATE"] = "UPDATE";
    OperacionAuditoria["DELETE"] = "DELETE";
})(OperacionAuditoria || (exports.OperacionAuditoria = OperacionAuditoria = {}));
var TipoMovimientoInventario;
(function (TipoMovimientoInventario) {
    TipoMovimientoInventario["INGRESO_COMPRA"] = "ingreso_compra";
    TipoMovimientoInventario["AJUSTE_MANUAL_POSITIVO"] = "ajuste_manual_positivo";
    TipoMovimientoInventario["AJUSTE_MANUAL_NEGATIVO"] = "ajuste_manual_negativo";
    TipoMovimientoInventario["CONSUMO_OT"] = "consumo_ot";
})(TipoMovimientoInventario || (exports.TipoMovimientoInventario = TipoMovimientoInventario = {}));
var estado_rendicion_gasto_enum_1 = require("./estado-rendicion-gasto.enum");
Object.defineProperty(exports, "EstadoRendicionGasto", { enumerable: true, get: function () { return estado_rendicion_gasto_enum_1.EstadoRendicionGasto; } });
//# sourceMappingURL=index.js.map