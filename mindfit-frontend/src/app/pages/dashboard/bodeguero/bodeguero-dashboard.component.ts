import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { InventarioService } from '../../../core/services/inventario.service';
import { SucursalesService } from '../../../core/services/sucursales.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  BodegaKpis,
  BodegaStockRow,
  MovimientoTrazabilidad,
  TipoMovimientoInventario,
} from '../../../core/models/inventario.model';
import { Sucursal } from '../../../core/models/sucursal.model';

type StockModalMode = 'ajustar' | 'ingreso';
type PanelMode = 'create' | 'edit' | 'stock' | 'trazabilidad' | null;

@Component({
  selector: 'app-bodeguero-dashboard',
  imports: [ReactiveFormsModule, LucideAngularModule, CurrencyPipe, DatePipe],
  templateUrl: './bodeguero-dashboard.component.html',
  styleUrl: './bodeguero-dashboard.component.css',
})
export class BodegueroDashboardComponent implements OnInit, OnDestroy {
  private readonly inventario = inject(InventarioService);
  private readonly sucursalesService = inject(SucursalesService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();
  private readonly busqueda$ = new Subject<string>();

  readonly stock = signal<BodegaStockRow[]>([]);
  readonly sedes = signal<Sucursal[]>([]);
  readonly kpis = signal<BodegaKpis | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly activePanel = signal<PanelMode>(null);
  readonly stockModalMode = signal<StockModalMode>('ajustar');
  readonly selectedRow = signal<BodegaStockRow | null>(null);
  readonly trazabilidad = signal<MovimientoTrazabilidad[]>([]);
  readonly trazabilidadLoading = signal(false);
  readonly filtroBusqueda = signal('');
  readonly trazabilidadSedeId = signal<number | null>(null);

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

  readonly createForm = this.fb.nonNullable.group({
    sku: ['', [Validators.required, Validators.maxLength(50)]],
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    descripcion: [''],
    costoUnitario: [0, [Validators.required, Validators.min(0)]],
  });

  readonly editForm = this.fb.nonNullable.group({
    sku: ['', Validators.required],
    nombre: ['', Validators.required],
    descripcion: [''],
    costoUnitario: [0, [Validators.required, Validators.min(0)]],
  });

  readonly stockForm = this.fb.nonNullable.group({
    sucursalId: ['', Validators.required],
    cantidad: [0, [Validators.required, Validators.min(1)]],
    nuevaCantidad: [0, [Validators.required, Validators.min(0)]],
    motivo: ['', [Validators.required, Validators.minLength(3)]],
  });

  ngOnInit(): void {
    this.busqueda$
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((q) => {
        this.filtroBusqueda.set(q);
        this.reloadStock();
      });

    this.sucursalesService.list().subscribe({
      next: (s) => this.sedes.set(s),
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

  toggleCreatePanel(): void {
    if (this.activePanel() === 'create') {
      this.closePanel();
      return;
    }
    this.createForm.reset({
      sku: '',
      nombre: '',
      descripcion: '',
      costoUnitario: 0,
    });
    this.activePanel.set('create');
  }

  openEditRepuesto(row: BodegaStockRow): void {
    this.selectedRow.set(row);
    this.editForm.reset({
      sku: row.repuesto.sku,
      nombre: row.repuesto.nombre,
      descripcion: row.repuesto.descripcion ?? '',
      costoUnitario: Number(row.repuesto.costoUnitario),
    });
    this.activePanel.set('edit');
  }

  openAjustar(row: BodegaStockRow): void {
    this.selectedRow.set(row);
    this.stockModalMode.set('ajustar');
    const defaultSede = this.sedes()[0]?.id ?? '';
    this.stockForm.reset({
      sucursalId: String(defaultSede),
      cantidad: 1,
      nuevaCantidad: row.cantidadActual,
      motivo: '',
    });
    this.activePanel.set('stock');
  }

  openIngreso(row: BodegaStockRow): void {
    this.selectedRow.set(row);
    this.stockModalMode.set('ingreso');
    const defaultSede = this.sedes()[0]?.id ?? '';
    this.stockForm.reset({
      sucursalId: String(defaultSede),
      cantidad: 1,
      nuevaCantidad: row.cantidadActual,
      motivo: '',
    });
    this.activePanel.set('stock');
  }

  openTrazabilidad(row: BodegaStockRow): void {
    this.selectedRow.set(row);
    this.trazabilidadSedeId.set(this.sedes()[0]?.id ?? null);
    this.activePanel.set('trazabilidad');
    this.loadTrazabilidad();
  }

  onTrazabilidadSedeChange(raw: string): void {
    const id = raw ? Number(raw) : null;
    this.trazabilidadSedeId.set(id);
    this.loadTrazabilidad();
  }

  loadTrazabilidad(): void {
    const row = this.selectedRow();
    if (!row) return;
    this.trazabilidadLoading.set(true);
    this.inventario
      .getTrazabilidad(row.repuestoId, this.trazabilidadSedeId() ?? undefined)
      .subscribe({
        next: (items) => {
          this.trazabilidad.set(items);
          this.trazabilidadLoading.set(false);
        },
        error: () => {
          this.trazabilidad.set([]);
          this.trazabilidadLoading.set(false);
          this.toast.error('No se pudo cargar la trazabilidad');
        },
      });
  }

  closePanel(): void {
    this.activePanel.set(null);
    this.selectedRow.set(null);
    this.trazabilidad.set([]);
  }

  submitCreateRepuesto(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const v = this.createForm.getRawValue();
    this.saving.set(true);
    this.inventario
      .createRepuesto({
        sku: v.sku,
        nombre: v.nombre,
        descripcion: v.descripcion || undefined,
        costoUnitario: v.costoUnitario,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.success('Repuesto creado en catálogo');
          this.closePanel();
          this.reloadAll();
        },
        error: (err) => {
          this.saving.set(false);
          const msg = err?.error?.message ?? 'No se pudo crear el repuesto';
          this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
        },
      });
  }

  submitEditRepuesto(): void {
    const row = this.selectedRow();
    if (!row || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const v = this.editForm.getRawValue();
    this.saving.set(true);
    this.inventario
      .updateRepuesto(row.repuestoId, {
        sku: v.sku,
        nombre: v.nombre,
        descripcion: v.descripcion || undefined,
        costoUnitario: v.costoUnitario,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.success('Repuesto actualizado (nombre y costo guardados)');
          this.closePanel();
          this.reloadAll();
        },
        error: (err) => {
          this.saving.set(false);
          const msg = err?.error?.message ?? 'No se pudo actualizar';
          this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
        },
      });
  }

  submitStock(): void {
    const row = this.selectedRow();
    if (!row || this.stockForm.invalid) {
      this.stockForm.markAllAsTouched();
      return;
    }

    const v = this.stockForm.getRawValue();
    const sucursalId = Number(v.sucursalId);
    const motivo = v.motivo.trim();

    let tipoMovimiento: TipoMovimientoInventario;
    let cantidad: number;

    if (this.stockModalMode() === 'ingreso') {
      tipoMovimiento = 'ingreso_compra';
      cantidad = v.cantidad;
    } else {
      const delta = v.nuevaCantidad - row.cantidadActual;
      if (delta === 0) {
        this.toast.error('La nueva cantidad es igual al stock actual');
        return;
      }
      if (delta > 0) {
        tipoMovimiento = 'ajuste_manual_positivo';
        cantidad = delta;
      } else {
        tipoMovimiento = 'ajuste_manual_negativo';
        cantidad = Math.abs(delta);
      }
    }

    this.saving.set(true);
    this.inventario
      .registrarAjuste({
        sucursalId,
        repuestoId: row.repuestoId,
        cantidad,
        tipoMovimiento,
        motivo,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.success('Movimiento registrado en Kardex');
          this.closePanel();
          this.reloadAll();
        },
        error: (err) => {
          this.saving.set(false);
          const msg = err?.error?.message ?? 'No se pudo registrar el movimiento';
          this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
        },
      });
  }

  softDeleteRepuesto(row: BodegaStockRow): void {
    if (
      !confirm(
        `¿Descontinuar «${row.repuesto.nombre}» del catálogo? El historial Kardex se conservará.`,
      )
    ) {
      return;
    }
    this.inventario.deleteRepuesto(row.repuestoId).subscribe({
      next: () => {
        this.toast.success('Repuesto descontinuado');
        this.reloadAll();
      },
      error: () => this.toast.error('No se pudo descontinuar el repuesto'),
    });
  }

  bajoMinimo(row: BodegaStockRow): boolean {
    return row.cantidadActual <= row.cantidadMinimaAlerta;
  }

  movimientoIcon(m: MovimientoTrazabilidad): string {
    if (m.tipoMovimiento === 'consumo_ot') return '🔧';
    if (m.tipoMovimiento === 'ingreso_compra') return '📦';
    if (m.esEntrada) return '📦';
    return '⚠️';
  }

  movimientoTipoLabel(m: MovimientoTrazabilidad): string {
    const map: Record<TipoMovimientoInventario, string> = {
      ingreso_compra: 'Ingreso por compra',
      ajuste_manual_positivo: 'Ajuste manual positivo',
      ajuste_manual_negativo: 'Ajuste manual negativo',
      consumo_ot: 'Consumo por reparación',
    };
    return map[m.tipoMovimiento] ?? m.tipoMovimiento;
  }

  signoCantidad(m: MovimientoTrazabilidad): string {
    return m.esEntrada ? '+' : '-';
  }
}
