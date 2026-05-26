import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { VentasService } from '../../../core/services/ventas.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  Cliente,
  ETAPAS_OPORTUNIDAD,
  EtapaOportunidad,
  Oportunidad,
} from '../../../core/models/ventas.model';

@Component({
  selector: 'app-oportunidades-ventas',
  imports: [ReactiveFormsModule, LucideAngularModule, CurrencyPipe],
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

  readonly form = this.fb.nonNullable.group({
    clienteId: [0, [Validators.required, Validators.min(1)]],
    titulo: ['', Validators.required],
    montoEstimado: [0, [Validators.min(0)]],
    notas: [''],
  });

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

  ngOnInit(): void {
    this.load();
    this.ventas.listClientes().subscribe({
      next: (c) => this.clientes.set(c),
    });
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
        notas: v.notas || undefined,
      })
      .subscribe({
        next: () => {
          this.toast.success('Oportunidad creada');
          this.form.reset({ clienteId: 0, montoEstimado: 0 });
          this.showForm.set(false);
          this.load();
        },
        error: () => this.toast.error('No se pudo crear la oportunidad'),
      });
  }

  moverEtapa(o: Oportunidad, etapa: EtapaOportunidad): void {
    this.ventas.updateOportunidad(o.id, { etapa }).subscribe({
      next: () => this.load(),
      error: () => this.toast.error('No se pudo actualizar la etapa'),
    });
  }

  convertirCotizacion(o: Oportunidad): void {
    void this.router.navigate(['/dashboard/ventas/cotizaciones'], {
      queryParams: { oportunidadId: o.id, clienteId: o.clienteId },
    });
  }

  puedeConvertir(etapa: EtapaOportunidad): boolean {
    return etapa === 'propuesta' || etapa === 'ganada';
  }

  etapaAnterior(etapa: EtapaOportunidad): EtapaOportunidad | null {
    const idx = this.etapas.findIndex((e) => e.id === etapa);
    return idx > 0 ? this.etapas[idx - 1].id : null;
  }

  etapaSiguiente(etapa: EtapaOportunidad): EtapaOportunidad | null {
    const idx = this.etapas.findIndex((e) => e.id === etapa);
    return idx < this.etapas.length - 1 ? this.etapas[idx + 1].id : null;
  }

  private load(): void {
    this.loading.set(true);
    this.ventas.listOportunidades().subscribe({
      next: (items) => {
        this.lista.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('No se pudieron cargar las oportunidades');
      },
    });
  }
}
