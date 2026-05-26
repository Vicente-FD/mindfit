"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadoRendicionGasto = exports.TipoMovimientoInventario = exports.OperacionAuditoria = exports.TipoEvidencia = exports.ClasificacionOrden = exports.EstadoOrdenTrabajo = exports.TipoMantenimiento = exports.PrioridadOrden = exports.EstadoCotizacionVenta = exports.EstadoOperacionalActivo = exports.CategoriaActivo = exports.EstadoSesionUsuario = exports.DivisaCodigo = exports.EtapaOportunidad = exports.RolUsuario = void 0;
var RolUsuario;
(function (RolUsuario) {
    RolUsuario["ADMIN"] = "admin";
    RolUsuario["JEFE_OPERACIONES"] = "jefe_operaciones";
    RolUsuario["TECNICO"] = "tecnico";
    RolUsuario["JEFE_SUCURSAL"] = "jefe_sucursal";
    RolUsuario["GERENTE_BI"] = "gerente_bi";
    RolUsuario["BODEGUERO"] = "bodeguero";
    RolUsuario["EJECUTIVO_VENTAS"] = "ejecutivo_ventas";
})(RolUsuario || (exports.RolUsuario = RolUsuario = {}));
var EtapaOportunidad;
(function (EtapaOportunidad) {
    EtapaOportunidad["PROSPECCION"] = "prospeccion";
    EtapaOportunidad["CALIFICACION"] = "calificacion";
    EtapaOportunidad["PROPUESTA"] = "propuesta";
    EtapaOportunidad["GANADA"] = "ganada";
    EtapaOportunidad["PERDIDA"] = "perdida";
})(EtapaOportunidad || (exports.EtapaOportunidad = EtapaOportunidad = {}));
var DivisaCodigo;
(function (DivisaCodigo) {
    DivisaCodigo["CLP"] = "CLP";
    DivisaCodigo["USD"] = "USD";
    DivisaCodigo["EUR"] = "EUR";
    DivisaCodigo["CAD"] = "CAD";
})(DivisaCodigo || (exports.DivisaCodigo = DivisaCodigo = {}));
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
    EstadoOperacionalActivo["RESERVADO_VENTA"] = "reservado_venta";
    EstadoOperacionalActivo["VENDIDO"] = "vendido";
})(EstadoOperacionalActivo || (exports.EstadoOperacionalActivo = EstadoOperacionalActivo = {}));
var EstadoCotizacionVenta;
(function (EstadoCotizacionVenta) {
    EstadoCotizacionVenta["PENDIENTE_APROBACION"] = "pendiente_aprobacion";
    EstadoCotizacionVenta["APROBADA"] = "aprobada";
    EstadoCotizacionVenta["RECHAZADA"] = "rechazada";
})(EstadoCotizacionVenta || (exports.EstadoCotizacionVenta = EstadoCotizacionVenta = {}));
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
    TipoMovimientoInventario["VENTA_COTIZACION"] = "venta_cotizacion";
})(TipoMovimientoInventario || (exports.TipoMovimientoInventario = TipoMovimientoInventario = {}));
var estado_rendicion_gasto_enum_1 = require("./estado-rendicion-gasto.enum");
Object.defineProperty(exports, "EstadoRendicionGasto", { enumerable: true, get: function () { return estado_rendicion_gasto_enum_1.EstadoRendicionGasto; } });
//# sourceMappingURL=index.js.map