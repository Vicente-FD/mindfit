import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  ActivosService,
  Activo,
  UpdateActivoPayload,
} from '../../core/services/activos.service';
import { MarcasService } from '../../core/services/marcas.service';
import { SucursalesService } from '../../core/services/sucursales.service';
import { ToastService } from '../../core/services/toast.service';
import {
  AssetCategory,
  CATEGORIAS_ACTIVO,
} from '../../core/models/analytics.model';
import { Marca } from '../../core/models/marca.model';
import { Sucursal } from '../../core/models/sucursal.model';
const ESTADOS_OPERACIONAL = [
  { value: 'operativo', label: 'Operativo' },
  { value: 'fuera_servicio', label: 'Fuera de servicio' },
  { value: 'mantenimiento_preventivo', label: 'Mantenimiento preventivo' },
] as const;

@Component({
  selector: 'app-edit-asset-modal',
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './edit-asset-modal.component.html',
  styleUrl: './edit-asset-modal.component.css',
})
export class EditAssetModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly activosService = inject(ActivosService);
  private readonly marcasService = inject(MarcasService);
  private readonly sucursalesService = inject(SucursalesService);
  private readonly toast = inject(ToastService);

  readonly activo = input.required<Activo>();
  readonly closed = output<void>();
  readonly saved = output<Activo>();

  readonly categorias = CATEGORIAS_ACTIVO;
  readonly estados = ESTADOS_OPERACIONAL;
  readonly marcas = signal<Marca[]>([]);
  readonly sucursales = signal<Sucursal[]>([]);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    marcaId: ['', Validators.required],
    modelo: [''],
    numeroSerie: [''],
    categoria: ['cardio' as AssetCategory, Validators.required],
    sucursalId: ['', Validators.required],
    fechaCompra: [''],
    fechaVencimientoGarantia: [''],
    costoAdquisicion: [null as number | null],
    estadoOperacional: ['operativo', Validators.required],
  });

  constructor() {
    this.marcasService.list().subscribe({ next: (m) => this.marcas.set(m) });
    this.sucursalesService.list().subscribe({ next: (s) => this.sucursales.set(s) });

    effect(() => {
      const a = this.activo();
      this.form.patchValue({
        nombre: a.nombre,
        marcaId: String(a.marcaId ?? ''),
        modelo: a.modelo ?? '',
        numeroSerie: a.numeroSerie ?? '',
        categoria: (a.categoria as AssetCategory) || 'cardio',
        sucursalId: String(a.sucursalId),
        fechaCompra: a.fechaCompra?.slice(0, 10) ?? '',
        fechaVencimientoGarantia: a.fechaVencimientoGarantia?.slice(0, 10) ?? '',
        costoAdquisicion: a.costoAdquisicion
          ? Number(a.costoAdquisicion)
          : null,
        estadoOperacional: a.estadoOperacional || 'operativo',
      });
    });
  }

  close(): void {
    this.closed.emit();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const payload: UpdateActivoPayload = {
      nombre: v.nombre,
      marcaId: Number(v.marcaId),
      modelo: v.modelo || undefined,
      numeroSerie: v.numeroSerie || undefined,
      categoria: v.categoria,
      sucursalId: Number(v.sucursalId),
      fechaCompra: v.fechaCompra || undefined,
      fechaVencimientoGarantia: v.fechaVencimientoGarantia || undefined,
      costoAdquisicion: v.costoAdquisicion ?? undefined,
      estadoOperacional: v.estadoOperacional,
    };

    this.saving.set(true);
    this.activosService.update(this.activo().id, payload).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.toast.success('Activo actualizado correctamente');
        this.saved.emit(updated);
        this.close();
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message ?? 'Error al actualizar activo';
        this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
      },
    });
  }
}
