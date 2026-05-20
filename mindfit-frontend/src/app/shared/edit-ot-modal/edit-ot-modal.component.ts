import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { WorkOrdersService } from '../../core/services/work-orders.service';
import { ToastService } from '../../core/services/toast.service';
import {
  ClasificacionOt,
  WorkOrder,
  WorkOrderPriority,
} from '../../core/models/work-order.model';
import { Usuario } from '../../core/models/usuario.model';
import { Sucursal } from '../../core/models/sucursal.model';
import { Activo } from '../../core/services/activos.service';
import { PRIORIDADES_OT } from '../../core/models/analytics.model';

@Component({
  selector: 'app-edit-ot-modal',
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './edit-ot-modal.component.html',
  styleUrl: './edit-ot-modal.component.css',
})
export class EditOtModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly workOrders = inject(WorkOrdersService);
  private readonly toast = inject(ToastService);

  readonly orden = input.required<WorkOrder>();
  readonly sucursales = input.required<Sucursal[]>();
  readonly activos = input.required<Activo[]>();
  readonly tecnicos = input.required<Usuario[]>();
  readonly closed = output<void>();
  readonly saved = output<WorkOrder>();

  readonly prioridades = PRIORIDADES_OT;
  readonly clasificacionTipo = signal<ClasificacionOt>('maquina');
  readonly sucursalFormId = signal('');
  readonly saving = signal(false);

  readonly activosFiltrados = computed(() => {
    const sid = this.sucursalFormId();
    if (!sid) return [];
    return this.activos().filter((a) => a.sucursalId === Number(sid));
  });

  readonly form = this.fb.nonNullable.group({
    titulo: ['', Validators.required],
    descripcion: [''],
    sucursalId: [{ value: '', disabled: true }],
    activoId: [''],
    prioridad: ['media' as WorkOrderPriority],
    asignadoAId: [''],
  });

  constructor() {
    effect(() => {
      const o = this.orden();
      const clasificacion = (o.clasificacion ?? 'maquina') as ClasificacionOt;
      this.clasificacionTipo.set(clasificacion);
      this.sucursalFormId.set(String(o.sucursalId));
      this.applyClasificacionValidators(clasificacion);

      this.form.patchValue({
        titulo: o.titulo,
        descripcion: o.descripcion ?? '',
        sucursalId: String(o.sucursalId),
        activoId: o.activoId ? String(o.activoId) : '',
        prioridad: o.prioridad,
        asignadoAId: o.asignadoAId ? String(o.asignadoAId) : '',
      });
    });
  }

  close(): void {
    this.closed.emit();
  }

  setClasificacion(tipo: ClasificacionOt): void {
    this.clasificacionTipo.set(tipo);
    this.applyClasificacionValidators(tipo);
    if (tipo === 'infraestructura') {
      this.form.patchValue({ activoId: '' });
    }
  }

  private applyClasificacionValidators(tipo: ClasificacionOt): void {
    const activoCtrl = this.form.controls.activoId;
    if (tipo === 'infraestructura') {
      activoCtrl.clearValidators();
    } else {
      activoCtrl.setValidators(Validators.required);
    }
    activoCtrl.updateValueAndValidity();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const clasificacion = this.clasificacionTipo();
    const o = this.orden();

    this.saving.set(true);
    this.workOrders
      .update(o.id, {
        titulo: v.titulo,
        descripcion: v.descripcion || undefined,
        prioridad: v.prioridad,
        clasificacion,
        activoId:
          clasificacion === 'maquina' && v.activoId
            ? Number(v.activoId)
            : clasificacion === 'infraestructura'
              ? null
              : undefined,
        asignadoAId: v.asignadoAId ? Number(v.asignadoAId) : null,
      })
      .subscribe({
        next: (updated) => {
          this.saving.set(false);
          this.toast.success('Orden de trabajo actualizada');
          this.saved.emit(updated);
          this.close();
        },
        error: (err) => {
          this.saving.set(false);
          const msg = err?.error?.message ?? 'Error al actualizar OT';
          this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
        },
      });
  }
}
