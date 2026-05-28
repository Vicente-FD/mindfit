import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { rolesGuard } from './core/guards/roles.guard';
import { permisoGuard } from './core/guards/permiso.guard';
import { dashboardRedirectGuard } from './core/guards/dashboard-redirect.guard';
import { mustChangePasswordGuard } from './core/guards/must-change-password.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: '404',
    loadComponent: () =>
      import('./pages/errors/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard, mustChangePasswordGuard],
    loadComponent: () =>
      import('./layout/dashboard-layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent,
      ),
    children: [
      {
        path: 'perfil',
        loadComponent: () =>
          import('./pages/dashboard/perfil/perfil.component').then(
            (m) => m.PerfilComponent,
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        canActivate: [dashboardRedirectGuard],
        children: [],
      },
      {
        path: 'admin',
        canActivate: [
          rolesGuard(['admin']),
          permisoGuard('verDashboardEjecutivo'),
        ],
        loadComponent: () =>
          import('./pages/dashboard/admin/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'bitacora',
        canActivate: [rolesGuard(['admin'])],
        loadComponent: () =>
          import('./pages/dashboard/admin/bitacora-admin.component').then(
            (m) => m.BitacoraAdminComponent,
          ),
      },
      {
        path: 'usuarios',
        canActivate: [permisoGuard('verGestionUsuarios')],
        loadComponent: () =>
          import('./pages/dashboard/admin/usuarios-admin.component').then(
            (m) => m.UsuariosAdminComponent,
          ),
      },
      {
        path: 'sucursales',
        canActivate: [permisoGuard('verGestionSucursales')],
        loadComponent: () =>
          import('./pages/dashboard/admin/sucursales-admin.component').then(
            (m) => m.SucursalesAdminComponent,
          ),
      },
      {
        path: 'parametros',
        canActivate: [permisoGuard('verParametrosSistema')],
        loadComponent: () =>
          import('./pages/dashboard/admin/parametros-admin.component').then(
            (m) => m.ParametrosAdminComponent,
          ),
      },
      {
        path: 'activos',
        canActivate: [
          permisoGuard(['verGestionActivos', 'verSoloVisualizarActivos']),
        ],
        loadComponent: () =>
          import('./pages/dashboard/activos/activos-gestion.component').then(
            (m) => m.ActivosGestionComponent,
          ),
      },
      {
        path: 'monitoreo',
        canActivate: [permisoGuard('verCentroMonitoreo')],
        loadComponent: () =>
          import('./pages/dashboard/monitoreo/sede-monitoreo.component').then(
            (m) => m.SedeMonitoreoComponent,
          ),
      },
      {
        path: 'jefe-operaciones',
        canActivate: [permisoGuard('verAsignacionOts')],
        loadComponent: () =>
          import('./pages/dashboard/jefe-operaciones/jefe-operaciones-dashboard.component').then(
            (m) => m.JefeOperacionesDashboardComponent,
          ),
      },
      {
        path: 'operations/planner',
        canActivate: [permisoGuard('verAsignacionOts')],
        loadComponent: () =>
          import('./pages/dashboard/operations/weekly-planner.component').then(
            (m) => m.WeeklyPlannerComponent,
          ),
      },
      {
        path: 'operations/gastos',
        canActivate: [permisoGuard('verAsignacionOts')],
        loadComponent: () =>
          import('./pages/dashboard/operations/gastos-ops.component').then(
            (m) => m.GastosOpsComponent,
          ),
      },
      {
        path: 'ventas',
        canActivate: [permisoGuard('verDashboardEjecutivo')],
        loadComponent: () =>
          import('./pages/dashboard/ventas/ventas-shell.component').then(
            (m) => m.VentasShellComponent,
          ),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/dashboard/ventas/ventas-dashboard.component').then(
                (m) => m.VentasDashboardComponent,
              ),
          },
          {
            path: 'clientes',
            loadComponent: () =>
              import('./pages/dashboard/ventas/clientes.component').then(
                (m) => m.ClientesVentasComponent,
              ),
          },
          {
            path: 'oportunidades',
            loadComponent: () =>
              import('./pages/dashboard/ventas/oportunidades.component').then(
                (m) => m.OportunidadesVentasComponent,
              ),
          },
          {
            path: 'cotizaciones',
            loadComponent: () =>
              import('./pages/dashboard/ventas/cotizaciones.component').then(
                (m) => m.CotizacionesVentasComponent,
              ),
          },
          {
            path: 'cotizaciones/nueva',
            loadComponent: () =>
              import('./pages/dashboard/ventas/crear-cotizacion.component').then(
                (m) => m.CrearCotizacionComponent,
              ),
          },
        ],
      },
      {
        path: 'operations/calendario',
        canActivate: [permisoGuard('verAsignacionOts')],
        loadComponent: () =>
          import('./pages/dashboard/shared/weekly-tracker-calendar.component').then(
            (m) => m.WeeklyTrackerCalendarComponent,
          ),
      },
      {
        path: 'flota',
        canActivate: [permisoGuard('verControlFlota')],
        loadComponent: () =>
          import('./pages/dashboard/flota/flota-dashboard.component').then(
            (m) => m.FlotaDashboardComponent,
          ),
      },
      {
        path: 'bodeguero',
        canActivate: [permisoGuard('verControlBodega')],
        loadComponent: () =>
          import('./pages/dashboard/bodeguero/bodeguero-dashboard.component').then(
            (m) => m.BodegueroDashboardComponent,
          ),
      },
      {
        path: 'tecnico',
        canActivate: [rolesGuard(['tecnico'])],
        loadComponent: () =>
          import('./pages/dashboard/tecnico/tecnico-dashboard.component').then(
            (m) => m.TecnicoDashboardComponent,
          ),
      },
      {
        path: 'gerente',
        canActivate: [permisoGuard('verDashboardEjecutivo')],
        loadComponent: () =>
          import('./pages/dashboard/gerente/gerente-dashboard.component').then(
            (m) => m.GerenteDashboardComponent,
          ),
      },
      {
        path: 'sucursal',
        canActivate: [rolesGuard(['jefe_sucursal'])],
        loadComponent: () =>
          import('./pages/dashboard/sucursal/sucursal-dashboard.component').then(
            (m) => m.SucursalDashboardComponent,
          ),
      },
      { path: '**', redirectTo: '/404' },
    ],
  },
  { path: '**', redirectTo: '404' },
];
