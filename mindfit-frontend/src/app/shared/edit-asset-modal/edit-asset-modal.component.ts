import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  ActivosService,
  Activo,
  UpdateActivoPayload,
} from '../../core/services/activos.service';
import { CategoriasService } from '../../core/services/categorias.service';
import { MarcasService } from '../../core/services/marcas.service';
import { SucursalesService } from '../../core/services/sucursales.service';
import { ToastService } from '../../core/services/toast.service';
import { Categoria } from '../../core/models/categoria.model';
import { Marca } from '../../core/models/marca.model';
import { Sucursal } from '../../core/models/sucursal.model';
import { MindfitDatePickerComponent } from '../../common/components/date-picker/date-picker.component';

const ESTADOS_OPERACIONAL = [
  { value: 'operativo', label: 'Operativo' },
  { value: 'fuera_servicio', label: 'Fuera de servicio' },
  { value: 'mantenimiento_preventivo', label: 'Mantenimiento preventivo' },
  { value: 'en_reparacion', label: 'En reparación' },
] as const;

@Component({
  selector: 'app-edit-asset-modal',
  imports: [ReactiveFormsModule, LucideAngularModule, MindfitDatePickerComponent],
  templateUrl: './edit-asset-modal.component.html',
  styleUrl: './edit-asset-modal.component.css',
})
export class EditAssetModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly activosService = inject(ActivosService);
  private readonly categoriasService = inject(CategoriasService);
  private readonly marcasService = inject(MarcasService);
  private readonly sucursalesService = inject(SucursalesService);
  private readonly toast = inject(ToastService);

  readonly activo = input.required<Activo>();
  readonly closed = output<void>();
  readonly saved = output<Activo>();

  readonly estados = ESTADOS_OPERACIONAL;
  readonly categorias = signal<Categoria[]>([]);
  readonly marcas = signal<Marca[]>([]);
  readonly sucursales = signal<Sucursal[]>([]);
  readonly saving = signal(false);
  readonly showPiso = signal(false);
  readonly pisosOpciones = signal<number[]>([]);

  readonly form = this.fb.group({
    nombre: ['', Validators.required],
    marcaId: ['', Validators.required],
    modelo: [''],
    numeroSerie: [''],
    categoriaId: ['', Validators.required],
    sucursalId: ['', Validators.required],
    pisoAsignado: [null as number | string | null],
    fechaCompra: [''],
    fechaVencimientoGarantia: [''],
    costoAdquisicion: [null as number | null],
    estadoOperacional: ['operativo', Validators.required],
  });

  constructor() {
    this.marcasService.list().subscribe({ next: (m) => this.marcas.set(m) });
    this.sucursalesService.list().subscribe({ next: (s) => this.sucursales.set(s) });
    this.categoriasService.list().subscribe({ next: (c) => this.categorias.set(c) });

    this.form.get('sucursalId')?.valueChanges.subscribe((id) => {
      this.applyPisoRules(id ? Number(id) : null);
    });

    effect(() => {
      const a = this.activo();
      const categoriaId =
        a.categoriaId ?? a.categoriaRelacion?.id ?? '';
      this.form.patchValue({
        nombre: a.nombre,
        marcaId: String(a.marcaId ?? ''),
        modelo: a.modelo ?? '',
        numeroSerie: a.numeroSerie ?? '',
        categoriaId: String(categoriaId),
        sucursalId: String(a.sucursalId),
        pisoAsignado: a.pisoAsignado ?? null,
        fechaCompra: a.fechaCompra?.slice(0, 10) ?? '',
        fechaVencimientoGarantia: a.fechaVencimientoGarantia?.slice(0, 10) ?? '',
        costoAdquisicion: a.costoAdquisicion
          ? Number(a.costoAdquisicion)
          : null,
        estadoOperacional: a.estadoOperacional || 'operativo',
      });
      this.applyPisoRules(a.sucursalId);
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

  close(): void {
    this.closed.emit();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const pisoRaw = v.pisoAsignado;
    const pisoAsignado =
      pisoRaw === '' || pisoRaw == null ? null : Number(pisoRaw);

    const payload: UpdateActivoPayload = {
      nombre: v.nombre!,
      marcaId: Number(v.marcaId),
      modelo: v.modelo || undefined,
      numeroSerie: v.numeroSerie || undefined,
      categoriaId: Number(v.categoriaId),
      sucursalId: Number(v.sucursalId),
      pisoAsignado,
      fechaCompra: v.fechaCompra || undefined,
      fechaVencimientoGarantia: v.fechaVencimientoGarantia || undefined,
      costoAdquisicion: v.costoAdquisicion ?? undefined,
      estadoOperacional: v.estadoOperacional!,
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
