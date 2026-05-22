import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { GastosService } from '../../../core/services/gastos.service';
import { GastosPdfReportService } from '../../../core/services/gastos-pdf-report.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  EstadoRendicionGasto,
  LIMITE_MENSUAL_GASTO,
  ListaGastosResponse,
  RendicionGasto,
  SaldoTecnicoResumen,
} from '../../../core/models/gastos.model';

function mesActual(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
}

@Component({
  selector: 'app-gastos-ops',
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './gastos-ops.component.html',
  styleUrl: './gastos-ops.component.css',
})
export class GastosOpsComponent implements OnInit {
  private readonly gastos = inject(GastosService);
  private readonly pdfReport = inject(GastosPdfReportService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly pendientes = signal<RendicionGasto[]>([]);
  readonly tecnicos = signal<SaldoTecnicoResumen[]>([]);
  readonly previewUrl = signal<string | null>(null);
  readonly decidingId = signal<number | null>(null);
  readonly rejectTarget = signal<RendicionGasto | null>(null);
  readonly rejectMotivo = signal('');

  readonly mesFiltro = signal(mesActual());
  readonly tecnicoFiltro = signal<number | ''>('');
  readonly estadoFiltro = signal<EstadoRendicionGasto | ''>('');
  readonly lista = signal<ListaGastosResponse | null>(null);
  readonly listaLoading = signal(false);
  readonly exportingPdf = signal(false);

  readonly limiteMensual = LIMITE_MENSUAL_GASTO;

  readonly mesLabel = computed(() => {
    const mes = this.lista()?.mes ?? this.mesFiltro();
    return this.pdfReport.mesLabelFromKey(mes);
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.gastos.getAdminView().subscribe({
      next: (data) => {
        this.pendientes.set(data.pendientes);
        this.tecnicos.set(data.tecnicos);
        this.loading.set(false);
        this.loadLista();
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('No se pudo cargar la rendición de gastos');
      },
    });
  }

  loadLista(): void {
    this.listaLoading.set(true);
    const tecnicoId = this.tecnicoFiltro();
    this.gastos
      .getLista({
        mes: this.mesFiltro(),
        tecnicoId: tecnicoId === '' ? undefined : tecnicoId,
        estado: this.estadoFiltro() || undefined,
      })
      .subscribe({
        next: (data) => {
          this.lista.set(data);
          this.listaLoading.set(false);
        },
        error: () => {
          this.listaLoading.set(false);
          this.toast.error('No se pudo cargar el listado de gastos');
        },
      });
  }

  onFiltrosChange(): void {
    this.loadLista();
  }

  async exportarPdf(): Promise<void> {
    const data = this.lista();
    if (!data) return;

    this.exportingPdf.set(true);
    try {
      const tecnicoId = this.tecnicoFiltro();
      let tecnicoLabel = 'Todos los técnicos';
      if (tecnicoId !== '') {
        const t = this.tecnicos().find((x) => x.tecnicoId === tecnicoId);
        tecnicoLabel = t?.tecnicoNombre ?? `Técnico #${tecnicoId}`;
      }
      if (this.estadoFiltro()) {
        tecnicoLabel += ` · ${this.estadoLabel(this.estadoFiltro() as EstadoRendicionGasto)}`;
      }

      await this.pdfReport.downloadPdf(data.items, data.resumen, {
        mes: data.mes,
        mesLabel: this.pdfReport.mesLabelFromKey(data.mes),
        tecnicoLabel,
      });
      this.toast.success('PDF de gastos mensuales generado');
    } catch {
      this.toast.error('No se pudo generar el PDF');
    } finally {
      this.exportingPdf.set(false);
    }
  }

  openPreview(url: string): void {
    this.previewUrl.set(url);
  }

  closePreview(): void {
    this.previewUrl.set(null);
  }

  aprobar(gasto: RendicionGasto): void {
    this.decidingId.set(gasto.id);
    this.gastos.decidir(gasto.id, { estado: 'aprobado' }).subscribe({
      next: () => {
        this.decidingId.set(null);
        this.toast.success(`Gasto de ${gasto.tecnicoNombre} aprobado`);
        this.load();
        this.loadLista();
      },
      error: (err) => {
        this.decidingId.set(null);
        const msg = err?.error?.message ?? 'No se pudo aprobar';
        const text = Array.isArray(msg) ? msg.join(', ') : String(msg);
        this.toast.error(text);
      },
    });
  }

  openReject(gasto: RendicionGasto): void {
    this.rejectTarget.set(gasto);
    this.rejectMotivo.set('');
  }

  closeReject(): void {
    this.rejectTarget.set(null);
    this.rejectMotivo.set('');
  }

  confirmReject(): void {
    const gasto = this.rejectTarget();
    const motivo = this.rejectMotivo().trim();
    if (!gasto || motivo.length < 3) {
      this.toast.error('Indique el motivo de rechazo (mínimo 3 caracteres)');
      return;
    }

    this.decidingId.set(gasto.id);
    this.gastos.decidir(gasto.id, { estado: 'rechazado', motivoRechazo: motivo }).subscribe({
      next: () => {
        this.decidingId.set(null);
        this.closeReject();
        this.toast.success('Gasto rechazado');
        this.load();
        this.loadLista();
      },
      error: (err) => {
        this.decidingId.set(null);
        const msg = err?.error?.message ?? 'No se pudo rechazar';
        const text = Array.isArray(msg) ? msg.join(', ') : String(msg);
        this.toast.error(text);
      },
    });
  }

  estadoLabel(estado: EstadoRendicionGasto): string {
    const map: Record<EstadoRendicionGasto, string> = {
      pendiente: 'Pendiente',
      aprobado: 'Aprobado',
      rechazado: 'Rechazado',
    };
    return map[estado];
  }

  estadoClass(estado: EstadoRendicionGasto): string {
    if (estado === 'aprobado') return 'estado-gasto--ok';
    if (estado === 'rechazado') return 'estado-gasto--bad';
    return 'estado-gasto--pending';
  }

  formatClp(value: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatFecha(fecha: string): string {
    const d = new Date(fecha + 'T12:00:00');
    return d.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  barWidth(porcentaje: number): string {
    return `${Math.min(100, Math.max(0, porcentaje))}%`;
  }
}
