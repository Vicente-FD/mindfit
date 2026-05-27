import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { SessionHeartbeatService } from '../../core/services/session-heartbeat.service';
import {
  DASHBOARD_NAV_ITEMS,
  filterVisibleNavItems,
} from '../../core/navigation/dashboard-nav.config';
import { QrScannerModalComponent } from '../qr-scanner-modal/qr-scanner-modal.component';
import { AssetDetailsSheetComponent } from '../asset-details-sheet/asset-details-sheet.component';
import { TecnicoUiService } from '../../core/services/tecnico-ui.service';
import { WorkOrder } from '../../core/models/work-order.model';
import { DashboardFooterComponent } from '../dashboard-footer/dashboard-footer.component';

@Component({
  selector: 'app-dashboard-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    QrScannerModalComponent,
    AssetDetailsSheetComponent,
    LucideAngularModule,
    DashboardFooterComponent,
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css',
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly sessionHeartbeat = inject(SessionHeartbeatService);
  readonly tecnicoUi = inject(TecnicoUiService);

  readonly user = this.auth.user;
  readonly permisosUi = this.auth.permisosUi;
  readonly showScanner = signal(false);

  readonly isMobileRole = computed(() => {
    const rol = this.user()?.rol;
    return rol === 'tecnico' || rol === 'jefe_sucursal';
  });

  readonly showQrFab = computed(() => this.user()?.rol === 'tecnico');

  readonly navLocked = this.auth.mustChangePassword;

  readonly navItems = DASHBOARD_NAV_ITEMS;

  readonly visibleNav = computed(() => {
    const u = this.user();
    if (!u) return [];
    this.permisosUi();
    return filterVisibleNavItems(this.navItems, u);
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

  onSheetStart(orden: WorkOrder): void {
    this.tecnicoUi.queueStart(orden);
  }

  onSheetClose(orden: WorkOrder): void {
    this.tecnicoUi.queueClose(orden);
  }

  onSheetViewTask(orden: WorkOrder): void {
    this.tecnicoUi.focusOrder(orden.id);
  }

  logout(): void {
    this.sessionHeartbeat.stop();
    this.auth.logout();
  }
}

