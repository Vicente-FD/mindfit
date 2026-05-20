import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ActivosService, Activo } from '../../../core/services/activos.service';
import { MarcasService } from '../../../core/services/marcas.service';
import { SucursalesService } from '../../../core/services/sucursales.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  AssetCategory,
  CATEGORIAS_ACTIVO,
} from '../../../core/models/analytics.model';
import { Sucursal } from '../../../core/models/sucursal.model';
import { Marca } from '../../../core/models/marca.model';
import { LucideAngularModule } from 'lucide-angular';
import { QrLabelModalComponent } from '../../../shared/qr-label-modal/qr-label-modal.component';
import { EditAssetModalComponent } from '../../../shared/edit-asset-modal/edit-asset-modal.component';
import { AssetHistoryModalComponent } from '../../../shared/asset-history-modal/asset-history-modal.component';

@Component({
  selector: 'app-activos-gestion',
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    QrLabelModalComponent,
    EditAssetModalComponent,
    AssetHistoryModalComponent,
  ],
  templateUrl: './activos-gestion.component.html',
  styleUrl: './activos-gestion.component.css',
})
export class ActivosGestionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly activosService = inject(ActivosService);
  private readonly marcasService = inject(MarcasService);
  private readonly sucursalesService = inject(SucursalesService);
  private readonly toast = inject(ToastService);

  readonly categorias = CATEGORIAS_ACTIVO;
  readonly sucursales = signal<Sucursal[]>([]);
  readonly marcas = signal<Marca[]>([]);
  readonly activos = signal<Activo[]>([]);
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly qrActivo = signal<Activo | null>(null);
  readonly editActivo = signal<Activo | null>(null);
  readonly historyActivo = signal<Activo | null>(null);

  readonly anios = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i);

  readonly filterForm = this.fb.nonNullable.group({
    sucursalId: [''],
    marcaId: [''],
    categoria: [''],
    anioCompra: [''],
    busqueda: [''],
  });

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    marcaId: ['', Validators.required],
    modelo: [''],
    categoria: ['cardio' as const, Validators.required],
    sucursalId: ['', Validators.required],
    fechaCompra: [''],
    fechaVencimientoGarantia: [''],
    costoAdquisicion: [null as number | null],
  });

  ngOnInit(): void {
    this.sucursalesService.list().subscribe({ next: (s) => this.sucursales.set(s) });
    this.marcasService.list().subscribe({ next: (m) => this.marcas.set(m) });
    this.loadActivos();
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.loadActivos());
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
        categoria: f.categoria ? (f.categoria as AssetCategory) : undefined,
        anioCompra: f.anioCompra ? Number(f.anioCompra) : undefined,
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
    this.activosService
      .create({
        nombre: v.nombre,
        marcaId: Number(v.marcaId),
        modelo: v.modelo || undefined,
        categoria: v.categoria,
        sucursalId: Number(v.sucursalId),
        fechaCompra: v.fechaCompra || undefined,
        fechaVencimientoGarantia: v.fechaVencimientoGarantia || undefined,
        costoAdquisicion: v.costoAdquisicion ?? undefined,
      })
      .subscribe({
        next: (activo) => {
          this.saving.set(false);
          this.toast.success(`Activo registrado: ${activo.codigoInventario}`);
          this.showForm.set(false);
          this.form.reset({
            nombre: '',
            marcaId: '',
            modelo: '',
            categoria: 'cardio',
            sucursalId: '',
            fechaCompra: '',
            fechaVencimientoGarantia: '',
            costoAdquisicion: null,
          });
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
}
