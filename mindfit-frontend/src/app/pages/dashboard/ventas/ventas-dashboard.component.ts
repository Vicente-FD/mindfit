import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { VentasService } from '../../../core/services/ventas.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  DashboardComercial,
  DashboardEjecutivo,
  ETAPA_LABEL,
  EtapaOportunidad,
  VentasDashboard,
} from '../../../core/models/ventas.model';

@Component({
  selector: 'app-ventas-dashboard',
  imports: [LucideAngularModule, CurrencyPipe, DecimalPipe],
  templateUrl: './ventas-dashboard.component.html',
  styleUrl: './ventas-dashboard.component.css',
})
export class VentasDashboardComponent implements OnInit {
  private readonly ventas = inject(VentasService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly dataOps = signal<DashboardEjecutivo | null>(null);
  readonly dataComercial = signal<DashboardComercial | null>(null);
  readonly etapaLabel = ETAPA_LABEL;
  readonly embudoMax = signal(1);

  readonly esVendedor = computed(() => {
    const rol = this.auth.user()?.rol;
    return rol === 'ejecutivo_ventas' || rol === 'gerente_bi';
  });

  readonly embudo = computed(() => {
    const d = this.esVendedor() ? this.dataComercial() : this.dataOps();
    return d?.embudo ?? [];
  });

  ngOnInit(): void {
    if (this.esVendedor()) {
      this.ventas.getDashboardComercial().subscribe({
        next: (d) => this.applyDashboard(d),
        error: () => this.onLoadError(true),
      });
      return;
    }

    this.ventas.getDashboardEjecutivo().subscribe({
      next: (d) => this.applyDashboard(d),
      error: () => this.onLoadError(false),
    });
  }

  private applyDashboard(d: DashboardComercial | DashboardEjecutivo): void {
    if (this.esVendedor()) {
      this.dataComercial.set(d as DashboardComercial);
      this.dataOps.set(null);
    } else {
      this.dataOps.set(d as DashboardEjecutivo);
      this.dataComercial.set(null);
    }
    const embudo = d.embudo ?? [];
    const max = Math.max(...embudo.map((e) => e.cantidad), 1);
    this.embudoMax.set(max);
    this.loading.set(false);
  }

  private onLoadError(comercial: boolean): void {
    this.loading.set(false);
    this.toast.error(
      comercial
        ? 'No se pudo cargar el centro de control comercial'
        : 'No se pudo cargar el dashboard ejecutivo',
    );
  }

  barPct(cantidad: number): number {
    const max = this.embudoMax();
    return Math.max(4, (cantidad / max) * 100);
  }

  labelEtapa(etapa: string): string {
    return this.etapaLabel[etapa as EtapaOportunidad] ?? etapa;
  }
}
