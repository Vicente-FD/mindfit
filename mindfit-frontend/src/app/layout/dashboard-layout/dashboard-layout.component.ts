import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { SessionHeartbeatService } from '../../core/services/session-heartbeat.service';
import { UserRole } from '../../core/models/user.model';
import { QrScannerModalComponent } from '../qr-scanner-modal/qr-scanner-modal.component';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-dashboard-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    QrScannerModalComponent,
    LucideAngularModule,
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css',
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly sessionHeartbeat = inject(SessionHeartbeatService);

  readonly user = this.auth.user;
  readonly showScanner = signal(false);

  readonly isMobileRole = computed(() => {
    const rol = this.user()?.rol;
    return rol === 'tecnico' || rol === 'jefe_sucursal';
  });

  readonly showQrFab = computed(() => this.user()?.rol === 'tecnico');

  readonly navItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard/admin',
      icon: 'layout-dashboard',
      roles: ['admin'],
    },
    {
      label: 'Órdenes de trabajo',
      route: '/dashboard/jefe-operaciones',
      icon: 'clipboard-list',
      roles: ['jefe_operaciones'],
    },
    {
      label: 'Gestión de Activos',
      route: '/dashboard/activos',
      icon: 'package',
      roles: ['admin', 'jefe_operaciones'],
    },
    {
      label: 'Personal y Permisos',
      route: '/dashboard/usuarios',
      icon: 'users',
      roles: ['admin', 'jefe_operaciones'],
    },
    {
      label: 'Reportar Falla',
      route: '/dashboard/sucursal',
      icon: 'alert-triangle',
      roles: ['jefe_sucursal'],
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
    },
  ];

  readonly visibleNav = computed(() => {
    const rol = this.user()?.rol;
    if (!rol) return [];
    return this.navItems.filter((item) => item.roles.includes(rol));
  });

  readonly ubicacionLabel = computed(() => {
    const u = this.user();
    if (!u) return 'Mindfit Ops';
    if (!u.sucursalId) return 'Casa Central';
    return u.sucursalNombre ?? `Sede #${u.sucursalId}`;
  });

  ngOnInit(): void {
    this.sessionHeartbeat.start();
  }

  ngOnDestroy(): void {
    this.sessionHeartbeat.stop();
  }

  openScanner(): void {
    this.showScanner.set(true);
  }

  closeScanner(): void {
    this.showScanner.set(false);
  }

  logout(): void {
    this.sessionHeartbeat.stop();
    this.auth.logout();
  }
}
