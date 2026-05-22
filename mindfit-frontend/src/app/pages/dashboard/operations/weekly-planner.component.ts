import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { WorkOrdersService } from '../../../core/services/work-orders.service';
import { SucursalesService } from '../../../core/services/sucursales.service';
import { ActivosService, Activo } from '../../../core/services/activos.service';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { ToastService } from '../../../core/services/toast.service';
import { Usuario } from '../../../core/models/usuario.model';
import { Sucursal } from '../../../core/models/sucursal.model';
import { BulkWorkOrderTask } from '../../../core/models/bulk-work-order.model';
import { ClasificacionOt, WorkOrderPriority } from '../../../core/models/work-order.model';

export const PLANNER_DAY_KEYS = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
] as const;

export type PlannerDayKey = (typeof PLANNER_DAY_KEYS)[number];

const DAY_LABELS: Record<PlannerDayKey, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
};

@Component({
  selector: 'app-weekly-planner',
  imports: [ReactiveFormsModule, LucideAngularModule, RouterLink],
  templateUrl: './weekly-planner.component.html',
  styleUrl: './weekly-planner.component.css',
})
export class WeeklyPlannerComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly workOrders = inject(WorkOrdersService);
  private readonly sucursalesService = inject(SucursalesService);
  private readonly activosService = inject(ActivosService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly dayKeys = PLANNER_DAY_KEYS;
  readonly dayLabels = DAY_LABELS;

  readonly sedes = signal<Sucursal[]>([]);
  readonly tecnicos = signal<Usuario[]>([]);
  readonly activosPorSede = signal<Record<number, Activo[]>>({});
  readonly saving = signal(false);

  readonly plannerForm = this.fb.nonNullable.group({
    tecnicoId: ['', Validators.required],
    weekOffset: [0, Validators.required],
    lunes: this.fb.array<FormGroup>([]),
    martes: this.fb.array<FormGroup>([]),
    miercoles: this.fb.array<FormGroup>([]),
    jueves: this.fb.array<FormGroup>([]),
    viernes: this.fb.array<FormGroup>([]),
  });

  ngOnInit(): void {
    this.sucursalesService.list().subscribe({
      next: (s) => this.sedes.set(s),
    });
    this.usuariosService.list().subscribe({
      next: (u) =>
        this.tecnicos.set(u.filter((x) => x.rol === 'tecnico' && x.estaActivo)),
    });
  }

  tasksForDay(day: PlannerDayKey): FormArray<FormGroup> {
    return this.plannerForm.get(day) as FormArray<FormGroup>;
  }

  weekRangeLabel(): string {
    const monday = this.getWeekMonday(Number(this.plannerForm.controls.weekOffset.value));
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    const fmt = (d: Date) =>
      d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
    return `${fmt(monday)} – ${fmt(friday)}`;
  }

  addTask(day: PlannerDayKey): void {
    this.tasksForDay(day).push(this.createTaskGroup());
  }

  removeTask(day: PlannerDayKey, index: number): void {
    this.tasksForDay(day).removeAt(index);
  }

  isMaquina(task: FormGroup): boolean {
    return task.get('tipoReporte')?.value === 'maquina';
  }

  onTipoReporteChange(task: FormGroup): void {
    const activoCtrl = task.get('activoId');
    if (this.isMaquina(task)) {
      activoCtrl?.setValidators([Validators.required]);
    } else {
      activoCtrl?.clearValidators();
      activoCtrl?.setValue('');
    }
    activoCtrl?.updateValueAndValidity();
  }

  onSucursalChange(task: FormGroup): void {
    const sucursalId = Number(task.get('sucursalId')?.value);
    task.get('activoId')?.setValue('');
    if (!sucursalId || Number.isNaN(sucursalId)) return;

    if (this.activosPorSede()[sucursalId]) return;

    this.activosService.list({ sucursalId }).subscribe({
      next: (activos) => {
        this.activosPorSede.update((m) => ({ ...m, [sucursalId]: activos }));
      },
    });
  }

  activosForTask(task: FormGroup): Activo[] {
    const sucursalId = Number(task.get('sucursalId')?.value);
    if (!sucursalId) return [];
    return this.activosPorSede()[sucursalId] ?? [];
  }

  totalTasks(): number {
    return PLANNER_DAY_KEYS.reduce(
      (sum, day) => sum + this.tasksForDay(day).length,
      0,
    );
  }

  submitPlan(): void {
    if (this.plannerForm.invalid) {
      this.plannerForm.markAllAsTouched();
      this.toast.error('Complete los campos obligatorios del plan');
      return;
    }

    const tecnicoId = Number(this.plannerForm.controls.tecnicoId.value);
    const weekOffset = Number(this.plannerForm.controls.weekOffset.value);
    const monday = this.getWeekMonday(weekOffset);
    const tasks: BulkWorkOrderTask[] = [];

    PLANNER_DAY_KEYS.forEach((day, dayIndex) => {
      const dayTasks = this.tasksForDay(day);
      dayTasks.controls.forEach((group) => {
        const v = group.getRawValue();
        const tipoReporte = v.tipoReporte as 'maquina' | 'infraestructura';
        const clasificacion: ClasificacionOt =
          tipoReporte === 'maquina' ? 'maquina' : 'infraestructura';

        const payload: BulkWorkOrderTask = {
          sucursalId: Number(v.sucursalId),
          titulo: String(v.titulo).trim(),
          clasificacion,
          prioridad: v.prioridad as WorkOrderPriority,
          tipoMantenimiento: v.tipoMantenimiento,
          fechaProgramacion: this.buildFechaProgramacion(
            monday,
            dayIndex,
            v.horaProgramada,
          ),
          asignadoAId: tecnicoId,
        };

        if (clasificacion === 'maquina' && v.activoId) {
          payload.activoId = Number(v.activoId);
        }

        tasks.push(payload);
      });
    });

    if (!tasks.length) {
      this.toast.error('Añada al menos una tarea en la semana');
      return;
    }

    this.saving.set(true);
    this.workOrders.crearOrdenesEnLote(tasks).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.toast.success(
          `Plan semanal guardado: ${res.total} OT${res.total === 1 ? '' : 's'} creadas`,
        );
        this.resetPlanner();
        void this.router.navigate(['/dashboard/jefe-operaciones']);
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message ?? 'No se pudo guardar el plan semanal';
        this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
      },
    });
  }

  private createTaskGroup(): FormGroup {
    const group = this.fb.group({
      titulo: ['', Validators.required],
      tipoReporte: ['maquina', Validators.required],
      sucursalId: ['', Validators.required],
      activoId: ['', Validators.required],
      prioridad: ['media' as WorkOrderPriority, Validators.required],
      tipoMantenimiento: ['preventivo' as 'correctivo' | 'preventivo', Validators.required],
      horaProgramada: ['09:00', Validators.required],
    });

    group.get('tipoReporte')?.valueChanges.subscribe(() => {
      this.onTipoReporteChange(group);
    });

    return group;
  }

  private resetPlanner(): void {
    PLANNER_DAY_KEYS.forEach((day) => {
      const arr = this.tasksForDay(day);
      while (arr.length) {
        arr.removeAt(0);
      }
    });
    this.plannerForm.patchValue({ tecnicoId: '', weekOffset: 0 });
    this.activosPorSede.set({});
  }

  private getWeekMonday(weekOffset: number): Date {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() + diffToMonday + weekOffset * 7);
    return monday;
  }

  private buildFechaProgramacion(
    monday: Date,
    dayIndex: number,
    hora: string,
  ): string {
    const d = new Date(monday);
    d.setDate(monday.getDate() + dayIndex);
    const [hours, minutes] = hora.split(':').map((n) => Number(n));
    d.setHours(hours || 9, minutes || 0, 0, 0);
    return d.toISOString();
  }
}
