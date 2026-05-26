export interface PermisosUi {
  verDashboardEjecutivo?: boolean;
  verGestionActivos?: boolean;
  verGestionUsuarios?: boolean;
  verGestionSucursales?: boolean;
  verParametrosSistema?: boolean;
  verCentroMonitoreo?: boolean;
  verAsignacionOts?: boolean;
  verReportesSucursal?: boolean;
  verControlBodega?: boolean;
  verRendicionGastos?: boolean;
  verGestionVentas?: boolean;
}

export const PERMISOS_UI_KEYS: (keyof PermisosUi)[] = [
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
  'verGestionVentas',
];

export const PERMISOS_UI_DEFAULT: PermisosUi = {
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
  verGestionVentas: false,
};

export const PERMISOS_BY_ROL: Record<string, PermisosUi> = {
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
    verGestionVentas: true,
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
    verGestionVentas: true,
  },
  ejecutivo_ventas: {
    verDashboardEjecutivo: true,
    verGestionVentas: true,
    verCentroMonitoreo: false,
    verAsignacionOts: false,
    verGestionActivos: false,
    verGestionUsuarios: false,
    verGestionSucursales: false,
    verParametrosSistema: false,
    verReportesSucursal: false,
    verControlBodega: false,
    verRendicionGastos: false,
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
    verGestionVentas: true,
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

/** Fusiona defaults por rol, overrides del usuario y claves legacy en JSONB. */
export function resolvePermisosUi(
  rol: string,
  overrides?: PermisosUi | Record<string, boolean> | null,
): PermisosUi {
  const base = { ...(PERMISOS_BY_ROL[rol] ?? PERMISOS_UI_DEFAULT) };
  const raw = (overrides ?? {}) as Record<string, boolean | undefined>;
  const merged: PermisosUi = { ...base };

  for (const key of PERMISOS_UI_KEYS) {
    if (raw[key] !== undefined) {
      merged[key] = raw[key];
    }
  }

  if (raw['verAsignacionOt'] !== undefined && raw['verCentroMonitoreo'] === undefined) {
    merged.verCentroMonitoreo = raw['verAsignacionOt'];
  }
  if (raw['verAsignacionOts'] !== undefined) {
    merged.verAsignacionOts = raw['verAsignacionOts'];
  }
  if (raw['generarQrActivos'] === true && !merged.verGestionActivos) {
    merged.verGestionActivos = true;
  }

  if (rol === 'jefe_operaciones') {
    merged.verGestionVentas = true;
  }

  return merged;
}

export function hasPermiso(
  rol: string,
  overrides: PermisosUi | null | undefined,
  key: keyof PermisosUi,
): boolean {
  return resolvePermisosUi(rol, overrides)[key] === true;
}
