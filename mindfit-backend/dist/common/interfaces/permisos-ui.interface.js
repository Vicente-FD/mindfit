"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISOS_BY_ROL = exports.PERMISOS_UI_DEFAULT = exports.PERMISOS_UI_KEYS = void 0;
exports.resolvePermisosUi = resolvePermisosUi;
exports.PERMISOS_UI_KEYS = [
    'verDashboardEjecutivo',
    'verGestionActivos',
    'verGestionUsuarios',
    'verGestionSucursales',
    'verParametrosSistema',
    'verCentroMonitoreo',
    'verAsignacionOts',
    'verReportesSucursal',
    'verControlBodega',
    'verRendicionGastos',
];
exports.PERMISOS_UI_DEFAULT = {
    verDashboardEjecutivo: false,
    verGestionActivos: false,
    verGestionUsuarios: false,
    verGestionSucursales: false,
    verParametrosSistema: false,
    verCentroMonitoreo: false,
    verAsignacionOts: false,
    verReportesSucursal: false,
    verControlBodega: false,
    verRendicionGastos: false,
};
function resolvePermisosUi(rol, overrides) {
    const base = { ...(exports.PERMISOS_BY_ROL[rol] ?? exports.PERMISOS_UI_DEFAULT) };
    const raw = (overrides ?? {});
    const merged = { ...base };
    for (const key of exports.PERMISOS_UI_KEYS) {
        if (raw[key] !== undefined) {
            merged[key] = raw[key];
        }
    }
    if (raw['verAsignacionOt'] !== undefined && merged.verCentroMonitoreo === undefined) {
        merged.verCentroMonitoreo = raw['verAsignacionOt'];
    }
    if (raw['verAsignacionOts'] !== undefined) {
        merged.verAsignacionOts = raw['verAsignacionOts'];
    }
    if (raw['generarQrActivos'] === true && merged.verGestionActivos === false) {
        merged.verGestionActivos = true;
    }
    return merged;
}
exports.PERMISOS_BY_ROL = {
    admin: {
        verDashboardEjecutivo: true,
        verGestionActivos: true,
        verGestionUsuarios: true,
        verGestionSucursales: true,
        verParametrosSistema: true,
        verCentroMonitoreo: true,
        verAsignacionOts: true,
        verReportesSucursal: true,
        verControlBodega: true,
        verRendicionGastos: true,
    },
    jefe_operaciones: {
        verDashboardEjecutivo: true,
        verGestionActivos: true,
        verGestionUsuarios: true,
        verGestionSucursales: false,
        verParametrosSistema: true,
        verCentroMonitoreo: true,
        verAsignacionOts: true,
        verReportesSucursal: false,
        verControlBodega: true,
        verRendicionGastos: true,
    },
    tecnico: {
        verDashboardEjecutivo: false,
        verGestionActivos: false,
        verGestionUsuarios: false,
        verGestionSucursales: false,
        verParametrosSistema: false,
        verCentroMonitoreo: false,
        verAsignacionOts: false,
        verReportesSucursal: false,
        verControlBodega: false,
    },
    jefe_sucursal: {
        verDashboardEjecutivo: false,
        verGestionActivos: false,
        verGestionUsuarios: false,
        verGestionSucursales: false,
        verParametrosSistema: false,
        verCentroMonitoreo: false,
        verAsignacionOts: false,
        verReportesSucursal: true,
        verControlBodega: false,
    },
    gerente_bi: {
        verDashboardEjecutivo: true,
        verGestionActivos: false,
        verGestionUsuarios: false,
        verGestionSucursales: false,
        verParametrosSistema: false,
        verCentroMonitoreo: true,
        verAsignacionOts: false,
        verReportesSucursal: false,
        verControlBodega: false,
    },
    bodeguero: {
        verDashboardEjecutivo: false,
        verGestionActivos: false,
        verGestionUsuarios: false,
        verGestionSucursales: false,
        verParametrosSistema: false,
        verCentroMonitoreo: false,
        verAsignacionOts: false,
        verReportesSucursal: false,
        verControlBodega: true,
    },
};
//# sourceMappingURL=permisos-ui.interface.js.map