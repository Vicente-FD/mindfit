import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { VentasService } from '../../../core/services/ventas.service';
import { ToastService } from '../../../core/services/toast.service';
import { MindfitDatePickerComponent } from '../../../common/components/date-picker/date-picker.component';
import {
  Cliente,
  DivisaCodigo,
  ETAPAS_OPORTUNIDAD,
  EtapaOportunidad,
  Oportunidad,
  OportunidadActividad,
  OportunidadChecklistItem,
  UpdateOportunidadPayload,
} from '../../../core/models/ventas.model';

@Component({
  selector: 'app-oportunidades-ventas',
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    MindfitDatePickerComponent,
  ],
  templateUrl: './oportunidades.component.html',
  styleUrl: './oportunidades.component.css',
})
export class OportunidadesVentasComponent implements OnInit {
  private readonly ventas = inject(VentasService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly etapas = ETAPAS_OPORTUNIDAD;
  readonly lista = signal<Oportunidad[]>([]);
  readonly clientes = signal<Cliente[]>([]);
  readonly loading = signal(false);
  readonly showForm = signal(false);
  readonly notaExpandida = signal<number | null>(null);
  readonly nuevaNota = signal<Record<number, string>>({});

  readonly form = this.fb.nonNullable.group({
    clienteId: [0, [Validators.required, Validators.min(1)]],
    titulo: ['', Validators.required],
    montoEstimado: [0, [Validators.min(0)]],
    divisaCodigo: ['CLP' as DivisaCodigo],
    fechaCierreEstimada: [''],
    notas: [''],
  });

  readonly columnIds = this.etapas.map((e) => `kanban-${e.id}`);

  readonly porEtapa = computed(() => {
    const map = new Map<EtapaOportunidad, Oportunidad[]>();
    for (const e of this.etapas) {
      map.set(e.id, []);
    }
    for (const o of this.lista()) {
      map.get(o.etapa)?.push(o);
    }
    return map;
  });

  readonly totalesPorEtapa = computed(() => {
    const map = new Map<EtapaOportunidad, number>();
    for (const e of this.etapas) {
      const items = this.porEtapa().get(e.id) ?? [];
      map.set(
        e.id,
        items.reduce((s, o) => s + Number(o.montoEstimado), 0),
      );
    }
    return map;
  });

  ngOnInit(): void {
    this.load();
    this.ventas.listClientes().subscribe({
      next: (c) => this.clientes.set(c),
    });
  }

  connectedLists(current: EtapaOportunidad): string[] {
    return this.columnIds.filter((id) => id !== `kanban-${current}`);
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
  }

  crear(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.ventas
      .createOportunidad({
        clienteId: v.clienteId,
        titulo: v.titulo,
        montoEstimado: v.montoEstimado,
        divisaCodigo: v.divisaCodigo,
        fechaCierreEstimada: v.fechaCierreEstimada || undefined,
        notas: v.notas || undefined,
      })
      .subscribe({
        next: () => {
          this.toast.success('Oportunidad creada');
          this.form.reset({
            clienteId: 0,
            montoEstimado: 0,
            divisaCodigo: 'CLP',
            fechaCierreEstimada: '',
          });
          this.showForm.set(false);
          this.load();
        },
        error: () => this.toast.error('No se pudo crear la oportunidad'),
      });
  }

  cardsEnEtapa(etapa: EtapaOportunidad): Oportunidad[] {
    return this.porEtapa().get(etapa) ?? [];
  }

  onDrop(event: CdkDragDrop<Oportunidad[]>, etapaDestino: EtapaOportunidad): void {
    const opp = event.item.data as Oportunidad;
    if (!opp || opp.etapa === etapaDestino) return;

    this.lista.update((list) =>
      list.map((o) =>
        o.id === opp.id ? { ...o, etapa: etapaDestino } : o,
      ),
    );

    this.ventas.updateOportunidad(opp.id, { etapa: etapaDestino }).subscribe({
      next: (actualizada) => {
        this.lista.update((list) =>
          list.map((o) => (o.id === actualizada.id ? actualizada : o)),
        );
      },
      error: () => {
        this.toast.error('No se pudo mover la oportunidad');
        this.load();
      },
    });
  }

  toggleChecklist(o: Oportunidad, item: OportunidadChecklistItem): void {
    const checklist = (o.checklist ?? []).map((c) =>
      c.id === item.id ? { ...c, completado: !c.completado } : c,
    );
    this.patchOportunidad(o.id, { checklist });
  }

  toggleNotas(o: Oportunidad): void {
    this.notaExpandida.update((id) => (id === o.id ? null : o.id));
  }

  onNotaInput(o: Oportunidad, value: string): void {
    this.nuevaNota.update((m) => ({ ...m, [o.id]: value }));
  }

  notaDraft(id: number): string {
    return this.nuevaNota()[id] ?? '';
  }

  agregarNota(o: Oportunidad): void {
    const texto = (this.nuevaNota()[o.id] ?? '').trim();
    if (!texto) return;
    const actividad: OportunidadActividad = {
      id: crypto.randomUUID(),
      texto,
      createdAt: new Date().toISOString(),
    };
    const actividades = [...(o.actividades ?? []), actividad];
    this.nuevaNota.update((m) => ({ ...m, [o.id]: '' }));
    this.patchOportunidad(o.id, { actividades });
  }

  actualizarFechaCierre(o: Oportunidad, fecha: string): void {
    this.patchOportunidad(o.id, {
      fechaCierreEstimada: fecha || null,
    });
  }

  convertirCotizacion(o: Oportunidad): void {
    void this.router.navigate(['/dashboard/ventas/cotizaciones/nueva'], {
      queryParams: { oportunidadId: o.id, clienteId: o.clienteId },
    });
  }

  divisaSymbol(codigo: string): string {
    if (codigo === 'USD') return 'US$';
    if (codigo === 'EUR') return '€';
    if (codigo === 'CAD') return 'CA$';
    return '$';
  }

  private patchOportunidad(id: number, payload: UpdateOportunidadPayload): void {
    this.ventas.updateOportunidad(id, payload).subscribe({
      next: (actualizada) => {
        this.lista.update((list) =>
          list.map((o) => (o.id === actualizada.id ? actualizada : o)),
        );
      },
      error: () => this.toast.error('No se pudo actualizar la oportunidad'),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.ventas.listOportunidades().subscribe({
      next: (items) => {
        this.lista.set(
          items.map((o) => ({
            ...o,
            checklist: o.checklist ?? [],
            actividades: o.actividades ?? [],
          })),
        );
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('No se pudieron cargar las oportunidades');
      },
    });
  }
}
