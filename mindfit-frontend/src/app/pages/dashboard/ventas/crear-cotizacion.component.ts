import { DecimalPipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  merge,
  of,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { VentasService } from '../../../core/services/ventas.service';
import { CotizacionPdfService } from '../../../core/services/cotizacion-pdf.service';
import { CotizacionExcelService } from '../../../core/services/cotizacion-excel.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  CatalogoVentaItem,
  Cliente,
  CotizacionDetalleLinea,
  DivisaCodigo,
  TasasDivisa,
} from '../../../core/models/ventas.model';

@Component({
  selector: 'app-crear-cotizacion',
  imports: [ReactiveFormsModule, LucideAngularModule, DecimalPipe, RouterLink],
  templateUrl: './crear-cotizacion.component.html',
  styleUrl: './crear-cotizacion.component.css',
})
export class CrearCotizacionComponent implements OnInit {
  private readonly ventas = inject(VentasService);
  private readonly pdf = inject(CotizacionPdfService);
  private readonly excel = inject(CotizacionExcelService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly clientes = signal<Cliente[]>([]);
  readonly lineas = signal<CotizacionDetalleLinea[]>([]);
  readonly catalogoLoading = signal(false);
  readonly catalogoError = signal<string | null>(null);
  readonly tasas = signal<TasasDivisa | null>(null);
  readonly saving = signal(false);
  readonly selectorAbierto = signal(false);
  readonly filtroCategoria = signal<string | null>(null);

  private readonly busqueda$ = new Subject<string>();

  private readonly catalogo$ = merge(
    this.busqueda$.pipe(debounceTime(220)),
  ).pipe(
    startWith(''),
    tap(() => {
      this.catalogoLoading.set(true);
      this.catalogoError.set(null);
    }),
    switchMap((q) =>
      this.ventas.buscarCatalogo(q, true).pipe(
        tap(() => this.catalogoLoading.set(false)),
        catchError((err) => {
          this.catalogoLoading.set(false);
          const msg = err?.error?.message;
          const text =
            err?.status === 403
              ? 'Su rol no tiene permiso para consultar el catálogo comercial.'
              : typeof msg === 'string'
                ? msg
                : 'No se pudo cargar el catálogo de Bodega Central';
          this.catalogoError.set(text);
          this.toast.error(text);
          return of([] as CatalogoVentaItem[]);
        }),
      ),
    ),
  );

  readonly catalogo = toSignal(this.catalogo$, { initialValue: [] as CatalogoVentaItem[] });

  readonly form = this.fb.nonNullable.group({
    clienteId: [0, [Validators.required, Validators.min(1)]],
    oportunidadId: [0],
    divisaCodigo: ['CLP' as DivisaCodigo, Validators.required],
    comentariosComerciales: [''],
  });

  readonly divisaCodigo = toSignal(
    this.form.controls.divisaCodigo.valueChanges.pipe(
      startWith(this.form.controls.divisaCodigo.value),
    ),
    { initialValue: 'CLP' as DivisaCodigo },
  );

  readonly filtroBusqueda = signal('');

  readonly catalogoFiltrado = computed(() => {
    const items = this.catalogo();
    const cat = this.filtroCategoria();
    const idsEnCotizacion = new Set(this.lineas().map((l) => l.activoId));
    return items.filter((i) => {
      if (idsEnCotizacion.has(i.id)) return false;
      if (!cat) return true;
      return i.categoria.toLowerCase().includes(cat.toLowerCase());
    });
  });

  readonly clienteSeleccionado = computed(() => {
    const id = this.form.controls.clienteId.value;
    return this.clientes().find((c) => c.id === id) ?? null;
  });

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

  ngOnInit(): void {
    this.ventas.listClientes().subscribe({
      next: (c) => this.clientes.set(c),
    });
    this.ventas.getTasas().subscribe({
      next: (t) => {
        this.tasas.set(t);
        if (this.lineas().length && this.divisaCodigo() !== 'CLP') {
          this.recalcularLineasPorDivisa(this.divisaCodigo());
        }
      },
      error: () => this.toast.error('No se pudieron cargar las tasas de cambio'),
    });

    const qp = this.route.snapshot.queryParamMap;
    const clienteId = Number(qp.get('clienteId'));
    const oportunidadId = Number(qp.get('oportunidadId'));
    if (clienteId) {
      this.form.patchValue({ clienteId, oportunidadId: oportunidadId || 0 });
    }

    this.form.controls.divisaCodigo.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((divisa) => this.recalcularLineasPorDivisa(divisa));
  }

  trackLinea(l: CotizacionDetalleLinea): string {
    return `${l.activoId}-${this.divisaCodigo()}`;
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

  recargarCatalogo(): void {
    this.busqueda$.next(this.filtroBusqueda());
  }

  onFiltroChange(value: string): void {
    this.filtroBusqueda.set(value);
    this.busqueda$.next(value);
    this.selectorAbierto.set(true);
  }

  toggleSelector(): void {
    this.selectorAbierto.update((v) => !v);
    if (this.selectorAbierto() && !this.catalogo().length) {
      this.busqueda$.next(this.filtroBusqueda());
    }
  }

  setFiltroCategoria(cat: string | null): void {
    this.filtroCategoria.set(cat);
  }

  agregarItem(item: CatalogoVentaItem): void {
    if (!item.habilitadoParaVenta) {
      this.toast.error(
        'Esta máquina no está habilitada para venta. Actívela en Bodega central → Máquinas en bodega.',
      );
      return;
    }
    if (this.lineas().some((l) => l.activoId === item.id)) {
      this.toast.error('Esta máquina ya está en la cotización');
      return;
    }

    const divisa = this.divisaCodigo();
    const tasa = this.tasaActual();
    const precioReferenciaClp = item.precioVentaClp;
    const precioDivisa = this.convertirDesdeClp(precioReferenciaClp, divisa, tasa);

    const linea: CotizacionDetalleLinea = {
      activoId: item.id,
      sku: item.sku,
      nombre: item.nombre,
      modelo: item.modelo,
      marca: item.marca,
      categoria: item.categoria,
      cantidad: 1,
      precioReferenciaClp,
      precioUnitarioPactado: precioDivisa,
      totalLineaNeto: precioDivisa,
    };
    this.lineas.update((list) => [...list, linea]);
    this.selectorAbierto.set(false);
  }

  quitarLinea(index: number): void {
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

  registrarYExportar(): void {
    if (this.form.invalid || !this.lineas().length) {
      this.form.markAllAsTouched();
      if (!this.lineas().length) {
        this.toast.error('Agregue al menos una máquina de Bodega Central');
      }
      return;
    }

    const v = this.form.getRawValue();
    const cliente = this.clientes().find((c) => c.id === v.clienteId);
    if (!cliente) {
      this.toast.error('Seleccione un cliente válido');
      return;
    }

    this.saving.set(true);
    this.ventas
      .createCotizacion({
        clienteId: v.clienteId,
        oportunidadId: v.oportunidadId > 0 ? v.oportunidadId : undefined,
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
        next: (cot) => {
          this.saving.set(false);
          const ejecutivo = this.auth.user()?.nombre;
          this.pdf.download(cot, cliente, ejecutivo);
          this.excel.download(cot, cliente);
          this.toast.success(
            `Cotización ${cot.folio} enviada a aprobación. Documentos descargados.`,
          );
          this.lineas.set([]);
          this.form.patchValue({ comentariosComerciales: '' });
        },
        error: (err) => {
          this.saving.set(false);
          const msg = err?.error?.message;
          this.toast.error(
            typeof msg === 'string'
              ? msg
              : Array.isArray(msg)
                ? msg[0]
                : 'Error al registrar cotización',
          );
        },
      });
  }

}
