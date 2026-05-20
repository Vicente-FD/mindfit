import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
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
  imports: [RouterOutlet, RouterLink, RouterLinkActive, QrScannerModalComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css',
})
export class DashboardLayoutComponent {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;
  readonly showScanner = signal(false);

  readonly isMobileRole = computed(() => {
    const rol = this.user()?.rol;
    return rol === 'tecnico' || rol === 'jefe_sucursal';
  });

  readonly showQrFab = computed(() => this.user()?.rol === 'tecnico');

  readonly hideLayoutHeader = computed(() => this.user()?.rol === 'tecnico');

  readonly navItems: NavItem[] = [
    {
      label: 'Admin',
      route: '/dashboard/admin',
      icon: 'grid',
      roles: ['admin'],
    },
    {
      label: 'OTs',
      route: '/dashboard/jefe-operaciones',
      icon: 'clipboard',
      roles: ['jefe_operaciones'],
    },
    {
      label: 'Tareas',
      route: '/dashboard/tecnico',
      icon: 'home',
      roles: ['tecnico'],
    },
    {
      label: 'BI',
      route: '/dashboard/gerente',
      icon: 'chart',
      roles: ['gerente_bi'],
    },
    {
      label: 'Sucursal',
      route: '/dashboard/sucursal',
      icon: 'alert',
      roles: ['jefe_sucursal'],
    },
  ];

  readonly visibleNav = computed(() => {
    const rol = this.user()?.rol;
    if (!rol) return [];
    return this.navItems.filter((item) => item.roles.includes(rol));
  });

  readonly statusLabel = computed(() => {
    const rol = this.user()?.rol;
    const map: Record<UserRole, string> = {
      admin: 'Sistema global',
      jefe_operaciones: 'Centro de operaciones',
      tecnico: 'En terreno',
      jefe_sucursal: 'Vista sucursal',
      gerente_bi: 'Analítica ejecutiva',
    };
    return rol ? map[rol] : 'Mindfit Ops';
  });

  openScanner(): void {
    this.showScanner.set(true);
  }

  closeScanner(): void {
    this.showScanner.set(false);
  }

  logout(): void {
    this.auth.logout();
  }
}
