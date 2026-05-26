import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { VentasService } from '../../../core/services/ventas.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  CotizacionVenta,
  ETAPA_LABEL,
  EtapaOportunidad,
  VentasDashboard,
} from '../../../core/models/ventas.model';

@Component({
  selector: 'app-reporteria-ventas',
  imports: [LucideAngularModule, CurrencyPipe],
  templateUrl: './reporteria-ventas.component.html',
  styleUrl: './reporteria-ventas.component.css',
})
export class ReporteriaVentasComponent implements OnInit {
  private readonly ventas = inject(VentasService);
  private readonly toast = inject(ToastService);

  readonly dashboard = signal<VentasDashboard | null>(null);
  readonly cotizaciones = signal<CotizacionVenta[]>([]);
  readonly loading = signal(true);
  readonly etapaLabel = ETAPA_LABEL;

  ngOnInit(): void {
    this.ventas.getDashboard().subscribe({
      next: (d) => this.dashboard.set(d),
      error: () => this.toast.error('Error al cargar reportería'),
    });
    this.ventas.listCotizaciones().subscribe({
      next: (c) => {
        this.cotizaciones.set(c);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Error al cargar cotizaciones');
      },
    });
  }

  exportarCsv(): void {
    const rows = this.cotizaciones();
    if (!rows.length) {
      this.toast.error('No hay cotizaciones para exportar');
      return;
    }
    const headers = [
      'Folio',
      'Cliente',
      'Divisa',
      'Subtotal',
      'IVA',
      'Bruto',
      'Fecha',
    ];
    const body = rows.map((c) => [
      c.folio,
      c.cliente?.razonSocial ?? String(c.clienteId),
      c.divisaCodigo,
      String(c.subtotalNeto),
      String(c.montoIva),
      String(c.montoBruto),
      c.createdAt,
    ]);
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [
      headers.join(';'),
      ...body.map((r) => r.map((x) => escape(String(x))).join(';')),
    ].join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporteria_Ventas_Mindfit_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  labelEtapa(etapa: string): string {
    return this.etapaLabel[etapa as EtapaOportunidad] ?? etapa;
  }
}
