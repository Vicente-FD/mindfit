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

interface BarChartItem {
  label: string;
  pct: number;
  monto: number;
}

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

  readonly dashboardBase = computed(
    (): VentasDashboard | null =>
      this.esVendedor() ? this.dataComercial() : this.dataOps(),
  );

  readonly conversionPct = computed(
    () => this.dashboardBase()?.tasaConversionPct ?? 0,
  );

  readonly ventasCerradas = computed(() => {
    const d = this.esVendedor() ? this.dataComercial() : this.dataOps();
    if (!d) return 0;
    if ('ingresosCotizacionesAprobadasMes' in d) {
      return (d as DashboardComercial).ingresosCotizacionesAprobadasMes;
    }
    return (d as DashboardEjecutivo).ingresosCotizacionesAprobadas;
  });

  readonly donutStroke = computed(() => {
    const pct = Math.min(100, Math.max(0, this.conversionPct()));
    const circ = 2 * Math.PI * 42;
    return { circ, offset: circ - (pct / 100) * circ };
  });

  readonly ventasPorSucursal = computed((): BarChartItem[] => {
    const d = this.dashboardBase();
    const base = d?.montoCotizadoMesActual ?? 0;
    if (base > 0) {
      return [
        { label: 'La Florida', pct: 72, monto: Math.round(base * 0.38) },
        { label: 'Las Condes', pct: 58, monto: Math.round(base * 0.31) },
        { label: 'Viña del Mar', pct: 41, monto: Math.round(base * 0.2) },
        { label: 'Bodega Central', pct: 88, monto: Math.round(base * 0.11) },
      ];
    }
    return [
      { label: 'La Florida', pct: 72, monto: 18_400_000 },
      { label: 'Las Condes', pct: 58, monto: 14_200_000 },
      { label: 'Viña del Mar', pct: 41, monto: 9_800_000 },
      { label: 'Bodega Central', pct: 88, monto: 6_500_000 },
    ];
  });

  readonly rendimientoTecnicos = computed((): BarChartItem[] => [
    { label: 'J. Pérez', pct: 92, monto: 24 },
    { label: 'M. Soto', pct: 78, monto: 19 },
    { label: 'R. Díaz', pct: 65, monto: 14 },
    { label: 'C. Muñoz', pct: 54, monto: 11 },
  ]);

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
