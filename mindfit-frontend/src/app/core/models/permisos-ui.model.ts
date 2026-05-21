export interface PermisosUi {
  verDashboardEjecutivo?: boolean;
  verGestionActivos?: boolean;
  verGestionUsuarios?: boolean;
  verAsignacionOt?: boolean;
  verReportesSucursal?: boolean;
  generarQrActivos?: boolean;
}

export const PERMISOS_BY_ROL: Record<string, PermisosUi> = {
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

export function resolvePermisosUi(
  rol: string,
  overrides?: PermisosUi | null,
): PermisosUi {
  const base = PERMISOS_BY_ROL[rol] ?? {};
  return { ...base, ...(overrides ?? {}) };
}

export function hasPermiso(
  rol: string,
  overrides: PermisosUi | null | undefined,
  key: keyof PermisosUi,
): boolean {
  return resolvePermisosUi(rol, overrides)[key] === true;
}
