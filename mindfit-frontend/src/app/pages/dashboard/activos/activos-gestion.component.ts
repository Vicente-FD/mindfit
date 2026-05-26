import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  catchError,
  debounceTime,
  map,
  merge,
  of,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { ActivosService, Activo } from '../../../core/services/activos.service';
import { CategoriasService } from '../../../core/services/categorias.service';
import { MarcasService } from '../../../core/services/marcas.service';
import { SucursalesService } from '../../../core/services/sucursales.service';
import { ToastService } from '../../../core/services/toast.service';
import { Categoria } from '../../../core/models/categoria.model';
import { Sucursal } from '../../../core/models/sucursal.model';
import { Marca } from '../../../core/models/marca.model';
import { LucideAngularModule } from 'lucide-angular';
import { QrLabelModalComponent } from '../../../shared/qr-label-modal/qr-label-modal.component';
import { EditAssetModalComponent } from '../../../shared/edit-asset-modal/edit-asset-modal.component';
import { AssetHistoryModalComponent } from '../../../shared/asset-history-modal/asset-history-modal.component';
import { environment } from '../../../../environments/environment';
import { MindfitDatePickerComponent } from '../../../common/components/date-picker/date-picker.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-activos-gestion',
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    QrLabelModalComponent,
    EditAssetModalComponent,
    AssetHistoryModalComponent,
    MindfitDatePickerComponent,
  ],
  templateUrl: './activos-gestion.component.html',
  styleUrl: './activos-gestion.component.css',
})
export class ActivosGestionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly activosService = inject(ActivosService);
  private readonly categoriasService = inject(CategoriasService);
  private readonly marcasService = inject(MarcasService);
  private readonly sucursalesService = inject(SucursalesService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  readonly categorias = signal<Categoria[]>([]);
  readonly sucursales = signal<Sucursal[]>([]);
  readonly marcas = signal<Marca[]>([]);
  readonly listLoading = signal(false);
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly qrActivo = signal<Activo | null>(null);
  readonly editActivo = signal<Activo | null>(null);
  readonly historyActivo = signal<Activo | null>(null);
  readonly showPiso = signal(false);
  readonly pisosOpciones = signal<number[]>([]);
  readonly trasladoActivo = signal<Activo | null>(null);
  readonly trasladoSucursalId = signal('');
  readonly trasladoLoading = signal(false);

  readonly puedeGestionarActivos = computed(() =>
    this.auth.canAccess('verGestionActivos'),
  );

  readonly modoSoloLectura = computed(
    () =>
      this.auth.canAccess('verSoloVisualizarActivos') &&
      !this.puedeGestionarActivos(),
  );

  readonly puedeTrasladar = computed(
    () => this.puedeGestionarActivos(),
  );

  readonly filterForm = this.fb.nonNullable.group({
    sucursalId: [''],
    marcaId: [''],
    categoriaId: [''],
    mesCompra: [''],
    busqueda: [''],
  });

  readonly form = this.fb.group({
    nombre: ['', Validators.required],
    marcaId: ['', Validators.required],
    modelo: [''],
    categoriaId: ['', Validators.required],
    sucursalId: [''],
    pisoAsignado: [null as number | null],
    fechaCompra: [''],
    fechaVencimientoGarantia: [''],
    costoAdquisicion: [null as number | null],
    cantidad: [1, [Validators.required, Validators.min(1), Validators.max(50)]],
  });

  private readonly reloadList$ = new Subject<void>();

  private readonly activos$ = merge(
    this.filterForm.valueChanges.pipe(debounceTime(350)),
    this.reloadList$,
  ).pipe(
    startWith(null),
    map(() => this.filterForm.getRawValue()),
    tap(() => this.listLoading.set(true)),
    switchMap((f) => {
      const soloBodega = f.sucursalId === 'bodega';
      return this.activosService
        .list({
          soloBodegaCentral: soloBodega || undefined,
          sucursalId:
            f.sucursalId && !soloBodega ? Number(f.sucursalId) : undefined,
          marcaId: f.marcaId ? Number(f.marcaId) : undefined,
          categoriaId: f.categoriaId ? Number(f.categoriaId) : undefined,
          anioCompra: f.mesCompra
            ? Number(String(f.mesCompra).split('-')[0])
            : undefined,
          busqueda: f.busqueda || undefined,
        })
        .pipe(
          tap(() => this.listLoading.set(false)),
          catchError(() => {
            this.listLoading.set(false);
            this.toast.error('Error al cargar activos');
            return of([] as Activo[]);
          }),
        );
    }),
  );

  readonly activos = toSignal(this.activos$, { initialValue: [] as Activo[] });

  ngOnInit(): void {
    this.sucursalesService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (s) => this.sucursales.set(s) });
    this.marcasService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (m) => this.marcas.set(m) });
    this.categoriasService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (c) => this.categorias.set(c) });

    this.form
      .get('sucursalId')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => {
        this.applyPisoRules(id ? Number(id) : null);
      });
  }

  private applyPisoRules(sucursalId: number | null): void {
    const ctrl = this.form.get('pisoAsignado');
    if (!ctrl) return;

    if (sucursalId == null) {
      this.showPiso.set(false);
      ctrl.clearValidators();
      ctrl.setValue(null);
      ctrl.updateValueAndValidity();
      return;
    }

    const sucursal = this.sucursales().find((s) => s.id === sucursalId);
    const pisos = sucursal?.cantidadPisos ?? 1;

    if (pisos > 1) {
      this.showPiso.set(true);
      this.pisosOpciones.set(
        Array.from({ length: pisos }, (_, i) => i + 1),
      );
      ctrl.setValidators(Validators.required);
    } else {
      this.showPiso.set(false);
      ctrl.clearValidators();
      ctrl.setValue(null);
    }
    ctrl.updateValueAndValidity();
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
  }

  loadActivos(): void {
    this.reloadList$.next();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.saving.set(true);
    const cantidad = Math.min(50, Math.max(1, Number(v.cantidad) || 1));

    this.activosService
      .create({
        nombre: v.nombre!,
        marcaId: Number(v.marcaId),
        modelo: v.modelo || undefined,
        categoriaId: Number(v.categoriaId),
        sucursalId: v.sucursalId ? Number(v.sucursalId) : null,
        pisoAsignado:
          v.pisoAsignado == null ? null : Number(v.pisoAsignado),
        fechaCompra: v.fechaCompra || undefined,
        fechaVencimientoGarantia: v.fechaVencimientoGarantia || undefined,
        costoAdquisicion: v.costoAdquisicion ?? undefined,
        cantidad,
      })
      .subscribe({
        next: (res) => {
          this.saving.set(false);
          const codigos = res.activos
            .map((a) => a.codigoInventario)
            .filter(Boolean)
            .slice(0, 3);
          const codigosHint =
            res.total > 3
              ? `${codigos.join(', ')} … (+${res.total - 3} más)`
              : codigos.join(', ');

          if (res.total === 1) {
            this.toast.success(
              `Activo registrado: ${res.activos[0]?.codigoInventario ?? ''}`,
            );
          } else {
            this.toast.success(
              `${res.total} activos registrados con códigos únicos (${codigosHint})`,
            );
          }

          if (res.total === 1 && res.activos[0]) {
            this.qrActivo.set(res.activos[0]);
          }

          this.showForm.set(false);
          this.form.reset({
            nombre: '',
            marcaId: '',
            modelo: '',
            categoriaId: '',
            sucursalId: '',
            pisoAsignado: null,
            fechaCompra: '',
            fechaVencimientoGarantia: '',
            costoAdquisicion: null,
            cantidad: 1,
          });
          this.showPiso.set(false);
          this.loadActivos();
        },
        error: (err) => {
          this.saving.set(false);
          const msg = err?.error?.message ?? 'Error al registrar activo';
          this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
        },
      });
  }

  openQr(activo: Activo): void {
    this.qrActivo.set(activo);
  }

  closeQr(): void {
    this.qrActivo.set(null);
  }

  openEdit(activo: Activo): void {
    this.editActivo.set(activo);
  }

  closeEdit(): void {
    this.editActivo.set(null);
  }

  onEditSaved(): void {
    this.loadActivos();
  }

  openHistory(activo: Activo): void {
    this.historyActivo.set(activo);
  }

  closeHistory(): void {
    this.historyActivo.set(null);
  }

  marcaLabel(activo: Activo): string {
    return activo.marcaRelacion?.nombre ?? activo.marca ?? '—';
  }

  marcaLogo(activo: Activo): string | null {
    const raw = activo.marcaRelacion?.logoUrl?.trim();
    if (!raw) return null;
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    if (raw.startsWith('/')) return `${environment.uploadsBaseUrl}${raw}`;
    return `${environment.uploadsBaseUrl}/${raw}`;
  }

  categoriaLabel(activo: Activo): string {
    const rel = activo.categoriaRelacion;
    if (rel) return `${rel.nombre} [${rel.sigla}]`;
    return activo.categoria ?? '—';
  }

  pisoLabel(activo: Activo): string | null {
    const pisos = activo.sucursal?.cantidadPisos ?? 1;
    if (pisos <= 1 || activo.pisoAsignado == null) return null;
    return `Piso ${activo.pisoAsignado}`;
  }

  healthDotClass(estado: string): string {
    const map: Record<string, string> = {
      operativo: 'health-dot health-dot--operativo',
      fuera_servicio: 'health-dot health-dot--downtime',
      mantenimiento_preventivo: 'health-dot health-dot--preventivo',
      en_reparacion: 'health-dot health-dot--reparacion',
    };
    return map[estado] ?? 'health-dot';
  }

  healthLabel(estado: string): string {
    const map: Record<string, string> = {
      operativo: 'Operativo',
      fuera_servicio: 'Fuera de servicio',
      mantenimiento_preventivo: 'Mantenimiento preventivo',
      en_reparacion: 'En reparación',
      reservado_venta: 'Reservada (venta)',
      vendido: 'Vendida',
    };
    return map[estado] ?? estado;
  }

  enBodega(activo: Activo): boolean {
    return activo.sucursalId == null;
  }

  ubicacionLabel(activo: Activo): string {
    if (this.enBodega(activo)) return 'Bodega Central';
    return activo.sucursal?.nombre ?? 'Sucursal';
  }

  puedeMover(activo: Activo): boolean {
    return (
      this.puedeTrasladar() &&
      activo.estadoOperacional !== 'reservado_venta' &&
      activo.estadoOperacional !== 'vendido'
    );
  }

  tieneQr(activo: Activo): boolean {
    return !!activo.codigoQrToken?.trim();
  }

  enviarABodega(activo: Activo): void {
    if (!this.puedeMover(activo)) return;
    const ok = confirm(
      `¿Enviar «${activo.nombre}» a Bodega Central?\n\nSe desactivará el QR de sucursal hasta un nuevo traslado.`,
    );
    if (!ok) return;
    this.ejecutarTraslado(activo, null);
  }

  abrirTrasladoSucursal(activo: Activo): void {
    if (!this.puedeMover(activo)) return;
    this.trasladoSucursalId.set('');
    this.trasladoActivo.set(activo);
  }

  cerrarTraslado(): void {
    this.trasladoActivo.set(null);
    this.trasladoSucursalId.set('');
  }

  confirmarTrasladoSucursal(): void {
    const activo = this.trasladoActivo();
    const id = this.trasladoSucursalId();
    if (!activo || !id) {
      this.toast.error('Seleccione la sucursal destino');
      return;
    }
    this.ejecutarTraslado(activo, Number(id));
  }

  private ejecutarTraslado(activo: Activo, nuevaSucursalId: number | null): void {
    this.trasladoLoading.set(true);
    this.activosService.traslado(activo.id, nuevaSucursalId).subscribe({
      next: (actualizado) => {
        this.trasladoLoading.set(false);
        this.cerrarTraslado();
        const destino = nuevaSucursalId == null
          ? 'Bodega Central'
          : this.sucursales().find((s) => s.id === nuevaSucursalId)?.nombre ??
            'sucursal';
        this.toast.success(`«${actualizado.nombre}» trasladada a ${destino}`);
        this.loadActivos();
        if (nuevaSucursalId != null && actualizado.codigoQrToken) {
          this.qrActivo.set(actualizado);
        }
      },
      error: (err) => {
        this.trasladoLoading.set(false);
        const msg = err?.error?.message;
        this.toast.error(
          typeof msg === 'string'
            ? msg
            : Array.isArray(msg)
              ? msg[0]
              : 'No se pudo completar el traslado',
        );
      },
    });
  }
}
