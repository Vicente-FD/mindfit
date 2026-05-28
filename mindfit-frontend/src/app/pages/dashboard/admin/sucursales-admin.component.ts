import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { SucursalesService } from '../../../core/services/sucursales.service';
import { ToastService } from '../../../core/services/toast.service';
import { Sucursal } from '../../../core/models/sucursal.model';
import { DeleteSucursalConfirmModalComponent } from '../../../shared/delete-sucursal-confirm-modal/delete-sucursal-confirm-modal.component';
import {
  CAPACIDAD_SECCIONES,
  LABEL_ELEMENTO,
  type CapacidadesServicios,
  type TipoElementoServicio,
  type TipoFacilidadKey,
  buildCapacidadesFormValue,
} from '../../../core/utils/capacidades-servicios.util';

const SIGLA_PATTERN = /^[A-Z]{2,3}$/;

function siglaValidator(control: AbstractControl): ValidationErrors | null {
  const v = String(control.value ?? '').trim().toUpperCase();
  if (!v) return { required: true };
  return SIGLA_PATTERN.test(v) ? null : { siglaFormat: true };
}

@Component({
  selector: 'app-sucursales-admin',
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    DeleteSucursalConfirmModalComponent,
  ],
  templateUrl: './sucursales-admin.component.html',
  styleUrl: './sucursales-admin.component.css',
})
export class SucursalesAdminComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly sucursalesService = inject(SucursalesService);
  private readonly toast = inject(ToastService);

  readonly sucursales = signal<Sucursal[]>([]);
  readonly selected = signal<Sucursal | null>(null);
  readonly showForm = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly deleteTarget = signal<Sucursal | null>(null);
  readonly isCreateMode = computed(
    () => this.showForm() && this.selected() === null,
  );

  readonly capacidadSecciones = CAPACIDAD_SECCIONES;
  readonly LABEL_ELEMENTO = LABEL_ELEMENTO;
  readonly capacidadesEdit = signal<CapacidadesServicios>(
    buildCapacidadesFormValue(),
  );

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    sigla: ['', [Validators.required, siglaValidator]],
    direccion: ['', Validators.required],
    comuna: ['', Validators.required],
    ciudad: ['', Validators.required],
    estaActiva: [true],
    cantidadPisos: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
  });

  readonly panelVisible = computed(
    () => this.showForm() || this.selected() !== null,
  );

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.sucursalesService.list().subscribe({
      next: (rows) => {
        this.sucursales.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('No se pudieron cargar las sucursales');
      },
    });
  }

  openCreate(): void {
    this.selected.set(null);
    this.showForm.set(true);
    this.capacidadesEdit.set(buildCapacidadesFormValue());
    this.form.reset({
      nombre: '',
      sigla: '',
      direccion: '',
      comuna: '',
      ciudad: '',
      estaActiva: true,
      cantidadPisos: 1,
    });
  }

  selectSucursal(s: Sucursal): void {
    this.showForm.set(false);
    this.selected.set(s);
    this.capacidadesEdit.set(buildCapacidadesFormValue(s.capacidadesServicios));
    this.form.patchValue({
      nombre: s.nombre,
      sigla: s.sigla,
      direccion: s.direccion ?? '',
      comuna: s.comuna ?? '',
      ciudad: s.ciudad ?? '',
      estaActiva: s.estaActiva ?? true,
      cantidadPisos: s.cantidadPisos ?? 1,
    });
  }

  closePanel(): void {
    this.showForm.set(false);
    this.selected.set(null);
    this.capacidadesEdit.set(buildCapacidadesFormValue());
  }

  capacidadValor(tipo: TipoFacilidadKey, el: TipoElementoServicio): number {
    return Number(this.capacidadesEdit()[tipo]?.[el] ?? 0);
  }

  setCapacidad(
    tipo: TipoFacilidadKey,
    el: TipoElementoServicio,
    raw: string,
  ): void {
    const n = Math.max(0, Math.min(99, Number(raw) || 0));
    this.capacidadesEdit.update((prev) => ({
      ...prev,
      [tipo]: { ...prev[tipo], [el]: n },
    }));
  }

  onSiglaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 3);
    input.value = cleaned;
    this.form.controls.sigla.setValue(cleaned);
    this.form.controls.sigla.updateValueAndValidity();
  }

  onToggleActiva(s: Sucursal, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.sucursalesService.update(s.id, { estaActiva: checked }).subscribe({
      next: (updated) => {
        this.sucursales.update((list) =>
          list.map((row) =>
            row.id === s.id
              ? { ...row, estaActiva: updated.estaActiva ?? checked }
              : row,
          ),
        );
        if (this.selected()?.id === s.id) {
          this.selected.set({ ...s, estaActiva: updated.estaActiva ?? checked });
          this.form.patchValue({ estaActiva: updated.estaActiva ?? checked });
        }
        this.toast.success(
          checked ? 'Sucursal activada comercialmente' : 'Sucursal desactivada',
        );
      },
      error: (err) => {
        (event.target as HTMLInputElement).checked = !checked;
        const msg = err?.error?.message ?? 'No se pudo actualizar el estado';
        this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const payload = {
      nombre: v.nombre.trim(),
      sigla: v.sigla.trim().toUpperCase(),
      direccion: v.direccion.trim(),
      comuna: v.comuna.trim(),
      ciudad: v.ciudad.trim(),
      estaActiva: v.estaActiva,
      cantidadPisos: Number(v.cantidadPisos),
      capacidadesServicios: this.capacidadesEdit(),
    };

    this.saving.set(true);
    const req = this.isCreateMode()
      ? this.sucursalesService.create(payload)
      : this.sucursalesService.update(this.selected()!.id, payload);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(
          this.isCreateMode() ? 'Sucursal creada' : 'Sucursal actualizada',
        );
        this.closePanel();
        this.reload();
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message ?? 'Error al guardar sucursal';
        this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
      },
    });
  }

  openDelete(): void {
    const s = this.selected();
    if (!s) return;
    this.deleteTarget.set(s);
  }

  closeDelete(): void {
    this.deleteTarget.set(null);
  }

  confirmDelete(): void {
    const s = this.deleteTarget();
    if (!s) return;
    this.deleting.set(true);
    this.sucursalesService.remove(s.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteTarget.set(null);
        this.closePanel();
        this.toast.success(`${s.nombre} dada de baja correctamente`);
        this.reload();
      },
      error: (err) => {
        this.deleting.set(false);
        const msg = err?.error?.message ?? 'No se pudo dar de baja la sucursal';
        this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
      },
    });
  }

  tieneActivosOperativos(s: Sucursal): boolean {
    return (s.activosOperativos ?? 0) > 0;
  }

  ubicacionLabel(s: Sucursal): string {
    const parts = [s.direccion, s.comuna, s.ciudad].filter(Boolean);
    return parts.join(' · ') || 'Sin dirección registrada';
  }
}
