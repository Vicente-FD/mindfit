import { CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { InventarioService } from '../../../core/services/inventario.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  BodegaKpis,
  BodegaStockRow,
} from '../../../core/models/inventario.model';

type StockModalMode = 'ajustar' | 'ingreso';

@Component({
  selector: 'app-bodeguero-dashboard',
  imports: [ReactiveFormsModule, LucideAngularModule, CurrencyPipe],
  templateUrl: './bodeguero-dashboard.component.html',
  styleUrl: './bodeguero-dashboard.component.css',
})
export class BodegueroDashboardComponent implements OnInit, OnDestroy {
  private readonly inventario = inject(InventarioService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();
  private readonly busqueda$ = new Subject<string>();

  readonly stock = signal<BodegaStockRow[]>([]);
  readonly kpis = signal<BodegaKpis | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly showModal = signal(false);
  readonly modalMode = signal<StockModalMode>('ajustar');
  readonly selectedRow = signal<BodegaStockRow | null>(null);
  readonly filtroBusqueda = signal('');

  readonly stockFiltrado = computed(() => {
    const rows = this.stock();
    const q = this.filtroBusqueda().trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const sku = r.repuesto?.sku?.toLowerCase() ?? '';
      const nombre = r.repuesto?.nombre?.toLowerCase() ?? '';
      return sku.includes(q) || nombre.includes(q);
    });
  });

  readonly alertasDetalle = computed(() =>
    this.stockFiltrado().filter(
      (r) => r.cantidadActual <= r.cantidadMinimaAlerta,
    ),
  );

  readonly stockForm = this.fb.nonNullable.group({
    cantidad: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.busqueda$
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((q) => {
        this.filtroBusqueda.set(q);
        this.reloadStock();
      });

    this.reloadAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onBusquedaInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.busqueda$.next(value);
  }

  reloadAll(): void {
    this.reloadKpis();
    this.reloadStock();
  }

  private reloadKpis(): void {
    this.inventario.getKpis().subscribe({
      next: (k) => this.kpis.set(k),
      error: () => this.kpis.set(null),
    });
  }

  private reloadStock(): void {
    this.loading.set(true);
    this.inventario
      .listStock(this.filtroBusqueda() || undefined)
      .subscribe({
        next: (rows) => {
          this.stock.set(rows);
          this.loading.set(false);
        },
        error: () => {
          this.stock.set([]);
          this.loading.set(false);
          this.toast.error('Error al cargar inventario de bodega');
        },
      });
  }

  openAjustar(row: BodegaStockRow): void {
    this.selectedRow.set(row);
    this.modalMode.set('ajustar');
    this.stockForm.reset({ cantidad: row.cantidadActual });
    this.showModal.set(true);
  }

  openIngreso(row: BodegaStockRow): void {
    this.selectedRow.set(row);
    this.modalMode.set('ingreso');
    this.stockForm.reset({ cantidad: 1 });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedRow.set(null);
  }

  submitStock(): void {
    const row = this.selectedRow();
    if (!row || this.stockForm.invalid) {
      this.stockForm.markAllAsTouched();
      return;
    }
    const cantidad = this.stockForm.controls.cantidad.value;
    this.saving.set(true);
    const req =
      this.modalMode() === 'ajustar'
        ? this.inventario.ajustarStock(row.id, cantidad)
        : this.inventario.registrarIngreso(row.id, cantidad);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(
          this.modalMode() === 'ajustar'
            ? 'Stock actualizado'
            : 'Ingreso registrado',
        );
        this.closeModal();
        this.reloadAll();
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message ?? 'No se pudo actualizar el stock';
        this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
      },
    });
  }

  bajoMinimo(row: BodegaStockRow): boolean {
    return row.cantidadActual <= row.cantidadMinimaAlerta;
  }
}
