export interface PermisosUi {
  verDashboardEjecutivo?: boolean;
  verGestionActivos?: boolean;
  verSoloVisualizarActivos?: boolean;
  verGestionUsuarios?: boolean;
  verGestionSucursales?: boolean;
  verParametrosSistema?: boolean;
  verCentroMonitoreo?: boolean;
  verAsignacionOts?: boolean;
  verReportesSucursal?: boolean;
  verControlBodega?: boolean;
  verControlFlota?: boolean;
}

export const PERMISOS_UI_KEYS: (keyof PermisosUi)[] = [
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

export const PERMISOS_UI_DEFAULT: PermisosUi = {
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

const ALL_TRUE: PermisosUi = Object.fromEntries(
  PERMISOS_UI_KEYS.map((k) => [k, true]),
) as PermisosUi;

const ALL_FALSE: PermisosUi = { ...PERMISOS_UI_DEFAULT };

/** Matriz predeterminada por rol (11 permisos). Técnico y jefe_sucursal usan vistas móviles propias. */
export const PERMISOS_BY_ROL: Record<string, PermisosUi> = {
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

export function getDefaultPermisosForRol(rol: string): PermisosUi {
  const base = PERMISOS_BY_ROL[rol] ?? PERMISOS_UI_DEFAULT;
  const merged: PermisosUi = { ...PERMISOS_UI_DEFAULT };
  for (const key of PERMISOS_UI_KEYS) {
    merged[key] = base[key] === true;
  }
  return merged;
}

/** Compatibilidad con claves legacy guardadas en JSONB. */
export function resolvePermisosUi(
  rol: string,
  overrides?: PermisosUi | Record<string, boolean> | null,
): PermisosUi {
  const base = getDefaultPermisosForRol(rol);
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
