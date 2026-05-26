import { AuthUser, UserRole } from '../models/user.model';
import { PermisosUi, resolvePermisosUi } from '../models/permisos-ui.model';

/** Orden idéntico al sidebar: la primera entrada visible define la ruta de aterrizaje. */
export interface DashboardNavItem {
  label: string;
  route: string;
  icon: string;
  roles: UserRole[];
  permiso?: keyof PermisosUi;
  permisoAny?: (keyof PermisosUi)[];
}

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    label: 'Dashboard',
    route: '/dashboard/admin',
    icon: 'layout-dashboard',
    roles: ['admin'],
    permiso: 'verDashboardEjecutivo',
  },
  {
    label: 'Centro de Monitoreo',
    route: '/dashboard/monitoreo',
    icon: 'activity',
    roles: ['admin', 'jefe_operaciones', 'gerente_bi'],
    permiso: 'verCentroMonitoreo',
  },
  {
    label: 'Centro de operaciones',
    route: '/dashboard/jefe-operaciones',
    icon: 'clipboard-list',
    roles: ['admin', 'jefe_operaciones'],
    permiso: 'verAsignacionOts',
  },
  {
    label: 'Centro Comercial',
    route: '/dashboard/ventas',
    icon: 'shopping-cart',
    roles: ['admin', 'ejecutivo_ventas', 'gerente_bi'],
    permiso: 'verDashboardEjecutivo',
  },
  {
    label: 'Calendario OT',
    route: '/dashboard/operations/calendario',
    icon: 'calendar-days',
    roles: ['admin', 'jefe_operaciones', 'gerente_bi'],
    permiso: 'verAsignacionOts',
  },
  {
    label: 'Rendición de Gastos',
    route: '/dashboard/operations/gastos',
    icon: 'wallet',
    roles: ['admin', 'jefe_operaciones'],
    permiso: 'verAsignacionOts',
  },
  {
    label: 'Control de Flota',
    route: '/dashboard/flota',
    icon: 'truck',
    roles: ['admin', 'jefe_operaciones'],
    permiso: 'verControlFlota',
  },
  {
    label: 'Control de bodega',
    route: '/dashboard/bodeguero',
    icon: 'warehouse',
    roles: ['bodeguero', 'jefe_operaciones', 'ejecutivo_ventas'],
    permiso: 'verControlBodega',
  },
  {
    label: 'Activos',
    route: '/dashboard/activos',
    icon: 'package',
    roles: ['admin', 'jefe_operaciones', 'gerente_bi', 'ejecutivo_ventas'],
    permisoAny: ['verGestionActivos', 'verSoloVisualizarActivos'],
  },
  {
    label: 'Personal y Permisos',
    route: '/dashboard/usuarios',
    icon: 'users',
    roles: ['admin', 'jefe_operaciones'],
    permiso: 'verGestionUsuarios',
  },
  {
    label: 'Sedes y Sucursales',
    route: '/dashboard/sucursales',
    icon: 'building-2',
    roles: ['admin'],
    permiso: 'verGestionSucursales',
  },
  {
    label: 'Parámetros del Sistema',
    route: '/dashboard/parametros',
    icon: 'settings',
    roles: ['admin', 'jefe_operaciones'],
    permiso: 'verParametrosSistema',
  },
  {
    label: 'Bitácora del sistema',
    route: '/dashboard/bitacora',
    icon: 'scroll-text',
    roles: ['admin'],
  },
  {
    label: 'Reportar Falla',
    route: '/dashboard/sucursal',
    icon: 'alert-triangle',
    roles: ['jefe_sucursal'],
    permiso: 'verReportesSucursal',
  },
  {
    label: 'Mis Tareas',
    route: '/dashboard/tecnico',
    icon: 'wrench',
    roles: ['tecnico'],
  },
  {
    label: 'Dashboard Ejecutivo',
    route: '/dashboard/gerente',
    icon: 'bar-chart-3',
    roles: ['gerente_bi', 'jefe_operaciones'],
    permiso: 'verDashboardEjecutivo',
  },
];

export function isNavItemVisible(
  item: DashboardNavItem,
  rol: UserRole,
  permisos: PermisosUi,
): boolean {
  if (!item.roles.includes(rol)) return false;
  if (item.permisoAny?.length) {
    return item.permisoAny.some((k) => permisos[k] === true);
  }
  if (item.permiso) {
    return permisos[item.permiso] === true;
  }
  return true;
}

export function filterVisibleNavItems(
  items: DashboardNavItem[],
  user: AuthUser,
): DashboardNavItem[] {
  const permisos = resolvePermisosUi(user.rol, user.permisosUi);
  return items.filter((item) => isNavItemVisible(item, user.rol, permisos));
}

/**
 * Ruta de aterrizaje según rol móvil o primer ítem visible del sidebar (permisos_ui).
 */
export function resolveLandingRoute(user: AuthUser): string {
  if (user.rol === 'tecnico') {
    return '/dashboard/tecnico';
  }
  if (user.rol === 'jefe_sucursal') {
    return '/dashboard/sucursal';
  }

  const visible = filterVisibleNavItems(DASHBOARD_NAV_ITEMS, user);
  if (visible.length > 0) {
    return visible[0].route;
  }

  return '/login';
}
