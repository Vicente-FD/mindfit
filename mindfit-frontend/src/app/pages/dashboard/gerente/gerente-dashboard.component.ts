import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { SucursalesService } from '../../../core/services/sucursales.service';
import {
  AssetCategory,
  CATEGORIAS_ACTIVO,
  KpisResponse,
  TecnicoOption,
} from '../../../core/models/analytics.model';
import { Sucursal } from '../../../core/models/sucursal.model';

@Component({
  selector: 'app-gerente-dashboard',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './gerente-dashboard.component.html',
  styleUrl: './gerente-dashboard.component.css',
})
export class GerenteDashboardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly analytics = inject(AnalyticsService);
  private readonly sucursalesService = inject(SucursalesService);

  readonly categorias = CATEGORIAS_ACTIVO;
  readonly sucursales = signal<Sucursal[]>([]);
  readonly tecnicos = signal<TecnicoOption[]>([]);
  readonly kpis = signal<KpisResponse | null>(null);
  readonly loading = signal(false);

  readonly filterForm = this.fb.nonNullable.group({
    sucursalId: [''],
    tecnicoId: [''],
    categoria: [''],
  });

  readonly maxCat = computed(() => {
    const items = this.kpis()?.fallasPorCategoria ?? [];
    return Math.max(1, ...items.map((f) => f.total));
  });

  ngOnInit(): void {
    this.sucursalesService.list().subscribe({
      next: (s) => this.sucursales.set(s),
    });
    this.analytics.listTecnicos().subscribe({
      next: (t) => this.tecnicos.set(t),
    });
    this.loadKpis();
  }

  loadKpis(): void {
    const v = this.filterForm.getRawValue();
    this.loading.set(true);
    this.analytics
      .getKpis({
        sucursalId: v.sucursalId ? Number(v.sucursalId) : undefined,
        tecnicoId: v.tecnicoId ? Number(v.tecnicoId) : undefined,
        categoria: v.categoria ? (v.categoria as AssetCategory) : undefined,
      })
      .subscribe({
        next: (k) => {
          this.kpis.set(k);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  barWidth(value: number, max: number): number {
    return Math.round((value / max) * 100);
  }
}
