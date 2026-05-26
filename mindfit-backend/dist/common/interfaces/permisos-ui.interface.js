"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISOS_BY_ROL = exports.PERMISOS_UI_DEFAULT = exports.PERMISOS_UI_KEYS = void 0;
exports.getDefaultPermisosForRol = getDefaultPermisosForRol;
exports.resolvePermisosUi = resolvePermisosUi;
exports.PERMISOS_UI_KEYS = [
    'verDashboardEjecutivo',
    'verGestionActivos',
    'verSoloVisualizarActivos',
    'verGestionUsuarios',
    'verGestionSucursales',
    'verParametrosSistema',
    'verCentroMonitoreo',
    'verAsignacionOts',
    'verReportesSucursal',
    'verControlBodega',
    'verControlFlota',
];
exports.PERMISOS_UI_DEFAULT = {
    verDashboardEjecutivo: false,
    verGestionActivos: false,
    verSoloVisualizarActivos: false,
    verGestionUsuarios: false,
    verGestionSucursales: false,
    verParametrosSistema: false,
    verCentroMonitoreo: false,
    verAsignacionOts: false,
    verReportesSucursal: false,
    verControlBodega: false,
    verControlFlota: false,
};
const ALL_TRUE = Object.fromEntries(exports.PERMISOS_UI_KEYS.map((k) => [k, true]));
const ALL_FALSE = { ...exports.PERMISOS_UI_DEFAULT };
exports.PERMISOS_BY_ROL = {
    admin: { ...ALL_TRUE },
    jefe_operaciones: {
        ...ALL_FALSE,
        verCentroMonitoreo: true,
        verAsignacionOts: true,
        verControlBodega: true,
        verGestionActivos: true,
        verGestionUsuarios: true,
        verControlFlota: true,
    },
    ejecutivo_ventas: {
        ...ALL_FALSE,
        verDashboardEjecutivo: true,
        verControlBodega: true,
        verGestionActivos: true,
    },
    bodeguero: {
        ...ALL_FALSE,
        verControlBodega: true,
    },
    gerente_bi: {
        ...ALL_FALSE,
        verCentroMonitoreo: true,
        verAsignacionOts: true,
        verDashboardEjecutivo: true,
        verSoloVisualizarActivos: true,
    },
    tecnico: { ...ALL_FALSE },
    jefe_sucursal: {
        ...ALL_FALSE,
        verReportesSucursal: true,
    },
};
function getDefaultPermisosForRol(rol) {
    const base = exports.PERMISOS_BY_ROL[rol] ?? exports.PERMISOS_UI_DEFAULT;
    const merged = { ...exports.PERMISOS_UI_DEFAULT };
    for (const key of exports.PERMISOS_UI_KEYS) {
        merged[key] = base[key] === true;
    }
    return merged;
}
function resolvePermisosUi(rol, overrides) {
    const base = getDefaultPermisosForRol(rol);
    const raw = (overrides ?? {});
    const merged = { ...base };
    for (const key of exports.PERMISOS_UI_KEYS) {
        if (raw[key] !== undefined) {
            merged[key] = raw[key];
        }
    }
    if (raw['verAsignacionOt'] !== undefined && raw['verCentroMonitoreo'] === undefined) {
        merged.verCentroMonitoreo = raw['verAsignacionOt'];
    }
    if (raw['verGestionVentas'] === true && merged.verDashboardEjecutivo === false) {
        merged.verDashboardEjecutivo = true;
    }
    if (raw['verRendicionGastos'] === true && merged.verAsignacionOts === false) {
        merged.verAsignacionOts = true;
    }
    if (raw['generarQrActivos'] === true) {
        merged.verGestionActivos = true;
    }
    return merged;
}
//# sourceMappingURL=permisos-ui.interface.js.map