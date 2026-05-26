import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { VentasService } from '../../../core/services/ventas.service';
import { CotizacionPdfService } from '../../../core/services/cotizacion-pdf.service';
import { CotizacionExcelService } from '../../../core/services/cotizacion-excel.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  CotizacionVenta,
  ESTADO_COTIZACION_LABEL,
  EstadoCotizacionVenta,
} from '../../../core/models/ventas.model';
import { CotizacionDetalleDialogComponent } from './cotizacion-detalle-dialog.component';

@Component({
  selector: 'app-cotizaciones-ventas',
  imports: [
    RouterLink,
    LucideAngularModule,
    CurrencyPipe,
    DatePipe,
    CotizacionDetalleDialogComponent,
  ],
  templateUrl: './cotizaciones.component.html',
  styleUrl: './cotizaciones.component.css',
})
export class CotizacionesVentasComponent implements OnInit {
  private readonly ventas = inject(VentasService);
  private readonly pdf = inject(CotizacionPdfService);
  private readonly excel = inject(CotizacionExcelService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  readonly cotizaciones = signal<CotizacionVenta[]>([]);
  readonly loading = signal(true);
  readonly procesandoId = signal<number | null>(null);
  readonly estadoLabel = ESTADO_COTIZACION_LABEL;

  readonly puedeAprobar = signal(false);
  readonly detalleId = signal<number | null>(null);

  ngOnInit(): void {
    const rol = this.auth.user()?.rol;
    this.puedeAprobar.set(rol === 'admin' || rol === 'jefe_operaciones');
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.ventas.listCotizaciones().subscribe({
      next: (c) => {
        this.cotizaciones.set(c);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('No se pudieron cargar las cotizaciones');
      },
    });
  }

  aprobar(c: CotizacionVenta): void {
    this.cambiarEstado(c, 'aprobada');
  }

  rechazar(c: CotizacionVenta): void {
    this.cambiarEstado(c, 'rechazada');
  }

  private cambiarEstado(
    c: CotizacionVenta,
    estado: Extract<EstadoCotizacionVenta, 'aprobada' | 'rechazada'>,
  ): void {
    this.procesandoId.set(c.id);
    this.ventas.actualizarEstadoCotizacion(c.id, estado).subscribe({
      next: () => {
        this.procesandoId.set(null);
        this.toast.success(
          estado === 'aprobada'
            ? `Cotización ${c.folio} aprobada`
            : `Cotización ${c.folio} rechazada — stock liberado`,
        );
        this.cargar();
      },
      error: (err) => {
        this.procesandoId.set(null);
        const msg = err?.error?.message;
        this.toast.error(typeof msg === 'string' ? msg : 'Error al actualizar estado');
      },
    });
  }

  verDetalle(c: CotizacionVenta): void {
    this.detalleId.set(c.id);
  }

  cerrarDetalle(): void {
    this.detalleId.set(null);
  }

  onCotizacionActualizada(c: CotizacionVenta): void {
    this.cotizaciones.update((list) =>
      list.map((item) => (item.id === c.id ? { ...item, ...c } : item)),
    );
  }

  exportarPdf(c: CotizacionVenta): void {
    if (!c.cliente) {
      this.toast.error('Falta información del cliente');
      return;
    }
    this.pdf.download(c, c.cliente, c.creadoPor?.nombre ?? this.auth.user()?.nombre);
  }

  exportarExcel(c: CotizacionVenta): void {
    if (!c.cliente) {
      this.toast.error('Falta información del cliente');
      return;
    }
    this.excel.download(c, c.cliente);
  }

  claseEstado(estado: EstadoCotizacionVenta): string {
    if (estado === 'aprobada') return 'estado--ok';
    if (estado === 'rechazada') return 'estado--bad';
    return 'estado--pending';
  }
}
