import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { distinctUntilChanged, startWith } from 'rxjs';
import { VentasService } from '../../../core/services/ventas.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  CotizacionDetalleLinea,
  CotizacionHistorialEntry,
  CotizacionVenta,
  DivisaCodigo,
  ESTADO_COTIZACION_LABEL,
  EstadoCotizacionVenta,
  TasasDivisa,
  TIPO_HISTORIAL_COTIZ_LABEL,
} from '../../../core/models/ventas.model';

type VistaModal = 'detalle' | 'editar' | 'historial';

@Component({
  selector: 'app-cotizacion-detalle-dialog',
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './cotizacion-detalle-dialog.component.html',
  styleUrl: './cotizacion-detalle-dialog.component.css',
})
export class CotizacionDetalleDialogComponent {
  private readonly ventas = inject(VentasService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly cotizacionId = input.required<number>();
  readonly cerrar = output<void>();
  readonly actualizada = output<CotizacionVenta>();

  readonly cotizacion = signal<CotizacionVenta | null>(null);
  readonly historial = signal<CotizacionHistorialEntry[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly vista = signal<VistaModal>('detalle');
  readonly lineas = signal<CotizacionDetalleLinea[]>([]);
  readonly tasas = signal<TasasDivisa | null>(null);

  readonly estadoLabel = ESTADO_COTIZACION_LABEL;
  readonly tipoHistorialLabel = TIPO_HISTORIAL_COTIZ_LABEL;

  readonly form = this.fb.nonNullable.group({
    divisaCodigo: ['CLP' as DivisaCodigo, Validators.required],
    comentariosComerciales: [''],
  });

  readonly divisaCodigo = signal<DivisaCodigo>('CLP');

  readonly puedeEditar = computed(
    () => this.cotizacion()?.estado === 'pendiente_aprobacion',
  );

  readonly tasaActual = computed(() =>
    this.tasaPorDivisa(this.divisaCodigo(), this.tasas()),
  );

  readonly subtotalNeto = computed(() =>
    this.lineas().reduce((s, l) => s + l.totalLineaNeto, 0),
  );

  readonly montoIva = computed(() => {
    if (this.divisaCodigo() !== 'CLP') return 0;
    return Math.round(this.subtotalNeto() * 0.19 * 100) / 100;
  });

  readonly montoBruto = computed(
    () => Math.round((this.subtotalNeto() + this.montoIva()) * 100) / 100,
  );

  readonly divisaSymbol = computed(() => {
    const d = this.divisaCodigo();
    if (d === 'USD') return 'US$';
    if (d === 'EUR') return '€';
    if (d === 'CAD') return 'CA$';
    return '$';
  });

  constructor() {
    effect(() => {
      const id = this.cotizacionId();
      if (id) this.cargar(id);
    });

    this.form.controls.divisaCodigo.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((divisa) => {
        this.divisaCodigo.set(divisa);
        this.recalcularLineasPorDivisa(divisa);
      });
  }

  cargar(id: number): void {
    this.loading.set(true);
    this.vista.set('detalle');
    this.ventas.getCotizacion(id).subscribe({
      next: (c) => {
        this.cotizacion.set(c);
        this.loading.set(false);
        this.patchFormFromCotizacion(c);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('No se pudo cargar la cotización');
        this.cerrar.emit();
      },
    });
    this.ventas.getCotizacionHistorial(id).subscribe({
      next: (h) => this.historial.set(h),
      error: () => this.historial.set([]),
    });
    if (!this.tasas()) {
      this.ventas.getTasas().subscribe({
        next: (t) => this.tasas.set(t),
      });
    }
  }

  setVista(v: VistaModal): void {
    if (v === 'editar' && !this.puedeEditar()) return;
    this.vista.set(v);
    if (v === 'editar') {
      const c = this.cotizacion();
      if (c) this.patchFormFromCotizacion(c);
    }
  }

  guardar(): void {
    const c = this.cotizacion();
    if (!c || !this.lineas().length) {
      this.toast.error('La cotización debe tener al menos una máquina');
      return;
    }

    this.saving.set(true);
    const v = this.form.getRawValue();
    this.ventas
      .updateCotizacion(c.id, {
        divisaCodigo: v.divisaCodigo,
        tasaCambioClp: this.tasaActual(),
        subtotalNeto: this.subtotalNeto(),
        montoIva: this.montoIva(),
        montoBruto: this.montoBruto(),
        comentariosComerciales: v.comentariosComerciales || undefined,
        detalles: this.lineas().map((l) => ({
          activoId: l.activoId,
          cantidad: 1,
          precioUnitarioPactado: l.precioUnitarioPactado,
          totalLineaNeto: l.totalLineaNeto,
        })),
      })
      .subscribe({
        next: (actualizada) => {
          this.saving.set(false);
          this.cotizacion.set(actualizada);
          this.patchFormFromCotizacion(actualizada);
          this.vista.set('detalle');
          this.actualizada.emit(actualizada);
          this.ventas.getCotizacionHistorial(c.id).subscribe({
            next: (h) => this.historial.set(h),
          });
          this.toast.success('Cotización actualizada — cambio registrado en historial');
        },
        error: (err) => {
          this.saving.set(false);
          const msg = err?.error?.message;
          this.toast.error(
            typeof msg === 'string'
              ? msg
              : Array.isArray(msg)
                ? msg[0]
                : 'Error al guardar cambios',
          );
        },
      });
  }

  quitarLinea(index: number): void {
    if (this.lineas().length <= 1) {
      this.toast.error('Debe quedar al menos una máquina en la cotización');
      return;
    }
    this.lineas.update((list) => list.filter((_, i) => i !== index));
  }

  actualizarPrecio(index: number, raw: string): void {
    const precio = Math.max(0, Number(raw) || 0);
    const divisa = this.divisaCodigo();
    const tasa = this.tasaActual();
    const precioReferenciaClp = this.convertirAClp(precio, divisa, tasa);
    this.lineas.update((list) =>
      list.map((l, i) => {
        if (i !== index) return l;
        return {
          ...l,
          precioReferenciaClp,
          precioUnitarioPactado: precio,
          totalLineaNeto: precio,
        };
      }),
    );
  }

  claseEstado(estado: EstadoCotizacionVenta): string {
    if (estado === 'aprobada') return 'estado--ok';
    if (estado === 'rechazada') return 'estado--bad';
    return 'estado--pending';
  }

  private patchFormFromCotizacion(c: CotizacionVenta): void {
    const divisa = (c.divisaCodigo ?? 'CLP') as DivisaCodigo;
    this.form.patchValue(
      {
        divisaCodigo: divisa,
        comentariosComerciales: c.comentariosComerciales ?? '',
      },
      { emitEvent: false },
    );
    this.divisaCodigo.set(divisa);

    const lineas: CotizacionDetalleLinea[] = (c.detalles ?? []).map((d) => {
      const precioUnit = Number(d.precioUnitarioPactado);
      const costoClp = Number(d.costoHistoricoClp ?? precioUnit);
      return {
        activoId: d.activoId ?? 0,
        sku: d.skuEstatico,
        nombre: d.nombreEstatico,
        modelo: null,
        marca: '',
        categoria: d.categoriaEstatica ?? '',
        cantidad: d.cantidad,
        precioReferenciaClp: costoClp,
        precioUnitarioPactado: precioUnit,
        totalLineaNeto: Number(d.totalLineaNeto),
      };
    });
    this.lineas.set(lineas);
  }

  private tasaPorDivisa(
    divisa: DivisaCodigo,
    tasas: TasasDivisa | null,
  ): number {
    if (!tasas) return 1;
    switch (divisa) {
      case 'USD':
        return tasas.USD;
      case 'EUR':
        return tasas.EUR;
      case 'CAD':
        return tasas.CAD;
      default:
        return 1;
    }
  }

  private convertirDesdeClp(
    precioClp: number,
    divisa: DivisaCodigo,
    tasa: number,
  ): number {
    if (divisa === 'CLP') {
      return Math.round(precioClp * 100) / 100;
    }
    return Math.round((precioClp / tasa) * 100) / 100;
  }

  private convertirAClp(
    monto: number,
    divisa: DivisaCodigo,
    tasa: number,
  ): number {
    if (divisa === 'CLP') {
      return Math.round(monto * 100) / 100;
    }
    return Math.round(monto * tasa * 100) / 100;
  }

  private recalcularLineasPorDivisa(divisa: DivisaCodigo): void {
    const tasa = this.tasaPorDivisa(divisa, this.tasas());
    this.lineas.update((list) =>
      list.map((l) => {
        const precio = this.convertirDesdeClp(l.precioReferenciaClp, divisa, tasa);
        return {
          ...l,
          precioUnitarioPactado: precio,
          totalLineaNeto: precio,
        };
      }),
    );
  }
}
