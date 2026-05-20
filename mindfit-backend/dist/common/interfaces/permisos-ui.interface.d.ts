export interface PermisosUi {
    verDashboardEjecutivo?: boolean;
    verGestionActivos?: boolean;
    verGestionUsuarios?: boolean;
    verAsignacionOt?: boolean;
    verReportesSucursal?: boolean;
    generarQrActivos?: boolean;
}
export declare const PERMISOS_UI_DEFAULT: PermisosUi;
export declare const PERMISOS_BY_ROL: Record<string, PermisosUi>;
