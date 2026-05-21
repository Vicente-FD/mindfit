"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISOS_BY_ROL = exports.PERMISOS_UI_DEFAULT = void 0;
exports.PERMISOS_UI_DEFAULT = {
    verDashboardEjecutivo: false,
    verGestionActivos: true,
    verGestionUsuarios: false,
    verAsignacionOt: true,
    verReportesSucursal: true,
    generarQrActivos: false,
};
exports.PERMISOS_BY_ROL = {
    admin: {
        verDashboardEjecutivo: true,
        verGestionActivos: true,
        verGestionUsuarios: true,
        verAsignacionOt: true,
        verReportesSucursal: true,
        generarQrActivos: true,
    },
    jefe_operaciones: {
        verDashboardEjecutivo: true,
        verGestionActivos: true,
        verGestionUsuarios: true,
        verAsignacionOt: true,
        verReportesSucursal: true,
        generarQrActivos: true,
    },
    tecnico: {
        verGestionActivos: false,
        verAsignacionOt: false,
        verReportesSucursal: false,
        generarQrActivos: false,
    },
    jefe_sucursal: {
        verReportesSucursal: true,
        verGestionActivos: false,
        generarQrActivos: false,
    },
    gerente_bi: {
        verDashboardEjecutivo: true,
        verGestionActivos: false,
        verGestionUsuarios: false,
        generarQrActivos: false,
    },
    bodeguero: {
        verGestionActivos: false,
        verGestionUsuarios: false,
        verAsignacionOt: false,
        verReportesSucursal: false,
        generarQrActivos: false,
    },
};
//# sourceMappingURL=permisos-ui.interface.js.map