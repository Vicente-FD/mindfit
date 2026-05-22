import { DatePipe } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { interval, Subscription } from 'rxjs';
import { SucursalesService } from '../../../core/services/sucursales.service';
import { Sucursal } from '../../../core/models/sucursal.model';
import {
  BitacoraTimelineItem,
  HistorialInfra,
  HistorialMaquina,
  MONITOREO_GLOBAL_KEY,
  MonitoreoSedeRef,
  SucursalMonitoreoResponse,
  TrabajoEnCurso,
} from '../../../core/models/sucursal-monitoreo.model';
import { resolveMediaUrl } from '../../../core/utils/media-url';

const POLL_MS = 30_000;
const TICK_MS = 60_000;

@Component({
  selector: 'app-sede-monitoreo',
  imports: [DatePipe, LucideAngularModule],
  templateUrl: './sede-monitoreo.component.html',
  styleUrl: './sede-monitoreo.component.css',
})
export class SedeMonitoreoComponent implements OnInit, OnDestroy {
  private readonly sucursalesService = inject(SucursalesService);

  readonly sedeGlobalKey = MONITOREO_GLOBAL_KEY;
  readonly sedes = signal<Sucursal[]>([]);
  readonly selectedKey = signal<string>(MONITOREO_GLOBAL_KEY);
  readonly data = signal<SucursalMonitoreoResponse | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly lightboxUrl = signal<string | null>(null);
  readonly tick = signal(0);

  readonly isGlobalView = computed(
    () => this.selectedKey() === MONITOREO_GLOBAL_KEY,
  );

  readonly scopeLabel = computed(() => {
    const d = this.data();
    if (!d) return '';
    return this.isGlobalView()
      ? `Consolidado de ${this.sedes().length} sedes`
      : d.sucursal.nombre;
  });

  private pollSub?: Subscription;
  private tickSub?: Subscription;

  ngOnInit(): void {
    this.sucursalesService.list().subscribe({
      next: (sedes) => {
        this.sedes.set(sedes);
        this.loadMonitoreo();
      },
      error: () => this.error.set('No se pudieron cargar las sedes'),
    });

    this.pollSub = interval(POLL_MS).subscribe(() => this.loadMonitoreo(false));

    this.tickSub = interval(TICK_MS).subscribe(() => this.tick.update((n) => n + 1));
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
    this.tickSub?.unsubscribe();
  }

  onSedeChange(raw: string): void {
    this.selectedKey.set(raw);
    this.loadMonitoreo();
  }

  loadMonitoreo(showSpinner = true): void {
    const key = this.selectedKey();
    if (!key) return;

    if (showSpinner) this.loading.set(true);
    this.error.set(null);

    const request$ =
      key === MONITOREO_GLOBAL_KEY
        ? this.sucursalesService.getMonitoreoGlobal()
        : this.sucursalesService.getMonitoreo(Number(key));

    request$.subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(
          this.isGlobalView()
            ? 'No se pudo cargar el monitoreo global'
            : 'No se pudo cargar el monitoreo de la sede',
        );
      },
    });
  }

  showSedeRef(
    item: Partial<MonitoreoSedeRef>,
  ): item is MonitoreoSedeRef {
    return (
      this.isGlobalView() &&
      !!item.sucursalNombre &&
      !!item.sucursalSigla
    );
  }

  sedeRefLabel(item: MonitoreoSedeRef): string {
    return `${item.sucursalNombre} (${item.sucursalSigla})`;
  }

  elapsedLabel(trabajo: TrabajoEnCurso): string {
    this.tick();
    if (!trabajo.fechaInicioReal) return trabajo.tiempoTranscurridoLabel;
    const diffMs = Date.now() - new Date(trabajo.fechaInicioReal).getTime();
    const totalMin = Math.max(0, Math.floor(diffMs / 60_000));
    const horas = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    return horas > 0
      ? `${horas}h ${mins.toString().padStart(2, '0')}m`
      : `${mins}m`;
  }

  mediaUrl(path: string | null | undefined): string {
    if (!path) return '';
    return resolveMediaUrl(path);
  }

  openPhoto(url: string | null): void {
    if (!url) return;
    this.lightboxUrl.set(this.mediaUrl(url));
  }

  closeLightbox(): void {
    this.lightboxUrl.set(null);
  }

  prioridadClass(prioridad: string): string {
    if (prioridad === 'alta') {
      return 'badge-priority-high';
    }
    if (prioridad === 'media') {
      return 'badge-priority-medium';
    }
    return 'badge-priority-low';
  }

  clasificacionLabel(c: string): string {
    const map: Record<string, string> = {
      maquina: 'Máquina',
      infraestructura: 'Infraestructura',
      peticion: 'Petición',
    };
    return map[c] ?? c;
  }

  clasificacionBadgeClass(c: string): string {
    if (c === 'infraestructura' || c === 'peticion') {
      return 'badge-infra';
    }
    return 'badge-machine';
  }

  estadoEnCursoLabel(estado: string): string {
    return estado === 'en_proceso' ? 'En proceso' : 'Asignada';
  }

  pingClass(estado: string): string {
    return estado === 'en_proceso'
      ? 'ping-live ping-live-green'
      : 'ping-live ping-live-blue';
  }

  hasPhotos(item: BitacoraTimelineItem): boolean {
    return !!(item.fotoAntesUrl || item.fotoDespuesUrl);
  }
}
