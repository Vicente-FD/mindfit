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
}
export declare const PERMISOS_UI_KEYS: (keyof PermisosUi)[];
export declare const PERMISOS_UI_DEFAULT: PermisosUi;
export declare function resolvePermisosUi(rol: string, overrides?: PermisosUi | Record<string, boolean> | null): PermisosUi;
export declare const PERMISOS_BY_ROL: Record<string, PermisosUi>;
