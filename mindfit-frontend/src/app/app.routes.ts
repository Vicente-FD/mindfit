import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { rolesGuard } from './core/guards/roles.guard';
import { permisoGuard } from './core/guards/permiso.guard';
import { dashboardRedirectGuard } from './core/guards/dashboard-redirect.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/dashboard-layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [dashboardRedirectGuard],
        children: [],
      },
      {
        path: 'admin',
        canActivate: [rolesGuard(['admin'])],
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
        canActivate: [rolesGuard(['admin', 'jefe_operaciones'])],
        loadComponent: () =>
          import('./pages/dashboard/admin/usuarios-admin.component').then(
            (m) => m.UsuariosAdminComponent,
          ),
      },
      {
        path: 'sucursales',
        canActivate: [rolesGuard(['admin'])],
        loadComponent: () =>
          import('./pages/dashboard/admin/sucursales-admin.component').then(
            (m) => m.SucursalesAdminComponent,
          ),
      },
      {
        path: 'parametros',
        canActivate: [rolesGuard(['admin', 'jefe_operaciones'])],
        loadComponent: () =>
          import('./pages/dashboard/admin/parametros-admin.component').then(
            (m) => m.ParametrosAdminComponent,
          ),
      },
      {
        path: 'activos',
        canActivate: [rolesGuard(['admin', 'jefe_operaciones'])],
        loadComponent: () =>
          import('./pages/dashboard/activos/activos-gestion.component').then(
            (m) => m.ActivosGestionComponent,
          ),
      },
      {
        path: 'monitoreo',
        canActivate: [
          rolesGuard(['admin', 'jefe_operaciones', 'gerente_bi']),
          permisoGuard('verCentroMonitoreo'),
        ],
        loadComponent: () =>
          import('./pages/dashboard/monitoreo/sede-monitoreo.component').then(
            (m) => m.SedeMonitoreoComponent,
          ),
      },
      {
        path: 'jefe-operaciones',
        canActivate: [
          rolesGuard(['admin', 'jefe_operaciones']),
          permisoGuard('verAsignacionOts'),
        ],
        loadComponent: () =>
          import('./pages/dashboard/jefe-operaciones/jefe-operaciones-dashboard.component').then(
            (m) => m.JefeOperacionesDashboardComponent,
          ),
      },
      {
        path: 'operations/planner',
        canActivate: [
          rolesGuard(['admin', 'jefe_operaciones']),
          permisoGuard('verAsignacionOts'),
        ],
        loadComponent: () =>
          import('./pages/dashboard/operations/weekly-planner.component').then(
            (m) => m.WeeklyPlannerComponent,
          ),
      },
      {
        path: 'bodeguero',
        canActivate: [rolesGuard(['bodeguero', 'jefe_operaciones'])],
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
        canActivate: [rolesGuard(['gerente_bi', 'jefe_operaciones'])],
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
    ],
  },
  { path: '**', redirectTo: 'login' },
];
