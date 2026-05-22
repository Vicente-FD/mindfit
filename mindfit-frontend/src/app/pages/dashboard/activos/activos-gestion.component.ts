import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
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
  private readonly activosService = inject(ActivosService);
  private readonly categoriasService = inject(CategoriasService);
  private readonly marcasService = inject(MarcasService);
  private readonly sucursalesService = inject(SucursalesService);
  private readonly toast = inject(ToastService);

  readonly categorias = signal<Categoria[]>([]);
  readonly sucursales = signal<Sucursal[]>([]);
  readonly marcas = signal<Marca[]>([]);
  readonly activos = signal<Activo[]>([]);
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly qrActivo = signal<Activo | null>(null);
  readonly editActivo = signal<Activo | null>(null);
  readonly historyActivo = signal<Activo | null>(null);
  readonly showPiso = signal(false);
  readonly pisosOpciones = signal<number[]>([]);

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
    sucursalId: ['', Validators.required],
    pisoAsignado: [null as number | null],
    fechaCompra: [''],
    fechaVencimientoGarantia: [''],
    costoAdquisicion: [null as number | null],
    cantidad: [1, [Validators.required, Validators.min(1), Validators.max(50)]],
  });

  ngOnInit(): void {
    this.sucursalesService.list().subscribe({ next: (s) => this.sucursales.set(s) });
    this.marcasService.list().subscribe({ next: (m) => this.marcas.set(m) });
    this.categoriasService.list().subscribe({ next: (c) => this.categorias.set(c) });
    this.loadActivos();
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.loadActivos());

    this.form.get('sucursalId')?.valueChanges.subscribe((id) => {
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
    const f = this.filterForm.getRawValue();
    this.activosService
      .list({
        sucursalId: f.sucursalId ? Number(f.sucursalId) : undefined,
        marcaId: f.marcaId ? Number(f.marcaId) : undefined,
        categoriaId: f.categoriaId ? Number(f.categoriaId) : undefined,
        anioCompra: f.mesCompra
          ? Number(String(f.mesCompra).split('-')[0])
          : undefined,
        busqueda: f.busqueda || undefined,
      })
      .subscribe({
        next: (a) => this.activos.set(a),
        error: () => this.toast.error('Error al cargar activos'),
      });
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
        sucursalId: Number(v.sucursalId),
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
    };
    return map[estado] ?? estado;
  }
}
