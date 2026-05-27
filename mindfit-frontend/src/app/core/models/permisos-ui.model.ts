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

/** Plantillas rápidas para cargar permisos por rol base. */
export const PERMISO_PLANTILLAS: { id: string; label: string }[] = [
  { id: '', label: '— Seleccionar plantilla —' },
  { id: 'admin', label: 'Super Admin (todos)' },
  { id: 'jefe_operaciones', label: 'Jefe de Operaciones' },
  { id: 'ejecutivo_ventas', label: 'Ejecutivo de Ventas' },
  { id: 'gerente_bi', label: 'Gerente / BI' },
  { id: 'bodeguero', label: 'Bodeguero' },
  { id: 'jefe_sucursal', label: 'Jefe de Sucursal' },
];

export function getDefaultPermisosForRol(rol: string): PermisosUi {
  const base = PERMISOS_BY_ROL[rol] ?? PERMISOS_UI_DEFAULT;
  const merged: PermisosUi = { ...PERMISOS_UI_DEFAULT };
  for (const key of PERMISOS_UI_KEYS) {
    merged[key] = base[key] === true;
  }
  return merged;
}

/** Fusiona defaults por rol, overrides del usuario y claves legacy en JSONB. */
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
  if (raw['verGestionVentas'] === true && !merged.verDashboardEjecutivo) {
    merged.verDashboardEjecutivo = true;
  }
  if (raw['verRendicionGastos'] === true && !merged.verAsignacionOts) {
    merged.verAsignacionOts = true;
  }
  if (raw['generarQrActivos'] === true && !merged.verGestionActivos) {
    merged.verGestionActivos = true;
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

export function hasAnyPermiso(
  rol: string,
  overrides: PermisosUi | null | undefined,
  keys: (keyof PermisosUi)[],
): boolean {
  const resolved = resolvePermisosUi(rol, overrides);
  return keys.some((k) => resolved[k] === true);
}

export interface PermisoLabelGroup {
  rol: string;
  titulo: string;
  items: { key: keyof PermisosUi; label: string }[];
}

export const PERMISO_LABEL_GROUPS: PermisoLabelGroup[] = [
  {
    rol: 'admin',
    titulo: 'Super Admin — acceso total',
    items: [
      { key: 'verDashboardEjecutivo', label: 'Dashboard Ejecutivo' },
      { key: 'verGestionActivos', label: 'Gestión de Activos (CRUD)' },
      { key: 'verSoloVisualizarActivos', label: 'Activos solo lectura' },
      { key: 'verGestionUsuarios', label: 'Personal y Permisos' },
      { key: 'verGestionSucursales', label: 'Sedes y Sucursales' },
      { key: 'verParametrosSistema', label: 'Parámetros del Sistema' },
      { key: 'verCentroMonitoreo', label: 'Centro de Monitoreo' },
      { key: 'verAsignacionOts', label: 'Centro de Operaciones / Gastos' },
      { key: 'verReportesSucursal', label: 'Reportar Falla (Sucursal)' },
      { key: 'verControlBodega', label: 'Control de Bodega' },
      { key: 'verControlFlota', label: 'Control de Flota' },
    ],
  },
  {
    rol: 'jefe_operaciones',
    titulo: 'Jefe de Operaciones — sugeridos',
    items: [
      { key: 'verCentroMonitoreo', label: 'Centro de Monitoreo' },
      { key: 'verAsignacionOts', label: 'Centro de Operaciones / Gastos' },
      { key: 'verControlBodega', label: 'Control de Bodega' },
      { key: 'verGestionActivos', label: 'Gestión de Activos (CRUD)' },
      { key: 'verGestionUsuarios', label: 'Personal y Permisos' },
      { key: 'verControlFlota', label: 'Control de Flota' },
    ],
  },
  {
    rol: 'gerente_bi',
    titulo: 'Gerencia / BI — sugeridos',
    items: [
      { key: 'verDashboardEjecutivo', label: 'Dashboard Ejecutivo' },
      { key: 'verCentroMonitoreo', label: 'Centro de Monitoreo' },
      { key: 'verAsignacionOts', label: 'Calendario / Operaciones' },
      { key: 'verSoloVisualizarActivos', label: 'Activos solo lectura + historial' },
    ],
  },
  {
    rol: 'ejecutivo_ventas',
    titulo: 'Ejecutivo de Ventas — sugeridos',
    items: [
      { key: 'verDashboardEjecutivo', label: 'Centro Comercial' },
      { key: 'verControlBodega', label: 'Control de Bodega' },
      { key: 'verGestionActivos', label: 'Gestión de Activos (CRUD)' },
    ],
  },
  {
    rol: 'bodeguero',
    titulo: 'Bodeguero — sugeridos',
    items: [{ key: 'verControlBodega', label: 'Control de Bodega' }],
  },
];

export const ROLES_SIN_MATRIZ_PERMISOS = new Set(['tecnico', 'jefe_sucursal']);

/** Lista única de permisos para la matriz compacta (11 píldoras). */
export const PERMISO_ALL_ITEMS: { key: keyof PermisosUi; label: string }[] =
  PERMISO_LABEL_GROUPS[0].items;
