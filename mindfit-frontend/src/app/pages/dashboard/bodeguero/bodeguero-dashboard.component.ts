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
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';
import {
  BodegaKpis,
  BodegaMaquina,
  BodegaStockRow,
  MovimientoTrazabilidad,
  TipoMovimientoInventario,
} from '../../../core/models/inventario.model';
import { Sucursal } from '../../../core/models/sucursal.model';

type StockModalMode = 'ajustar' | 'ingreso';
type PanelMode = 'create' | 'edit' | 'stock' | 'trazabilidad' | null;
type VistaBodega = 'repuestos' | 'maquinas';

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
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();
  private readonly busqueda$ = new Subject<string>();

  readonly vista = signal<VistaBodega>('repuestos');
  readonly stock = signal<BodegaStockRow[]>([]);
  readonly maquinas = signal<BodegaMaquina[]>([]);
  readonly maquinasLoading = signal(false);
  readonly maquinaVentaSavingId = signal<number | null>(null);
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
  readonly filtroMarca = signal<string | null>(null);
  readonly filtroCategoria = signal<string | null>(null);
  readonly trazabilidadSedeId = signal<number | null>(null);

  readonly marcasDisponibles = computed(() => {
    const set = new Set(this.maquinas().map((m) => m.marca).filter(Boolean));
    return [...set].sort();
  });

  readonly categoriasDisponibles = computed(() => {
    const set = new Set(this.maquinas().map((m) => m.categoria).filter(Boolean));
    return [...set].sort();
  });

  readonly maquinasFiltradas = computed(() => {
    const rows = this.maquinas();
    const q = this.filtroBusqueda().trim().toLowerCase();
    const marca = this.filtroMarca();
    const cat = this.filtroCategoria();
    return rows.filter((m) => {
      if (marca && m.marca !== marca) return false;
      if (cat && m.categoria !== cat) return false;
      if (!q) return true;
      const cod = m.codigoInventario?.toLowerCase() ?? '';
      const nombre = m.nombre?.toLowerCase() ?? '';
      return cod.includes(q) || nombre.includes(q);
    });
  });

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

  nivelStock(row: BodegaStockRow): 'ok' | 'warn' | 'crit' {
    const actual = row.cantidadActual;
    const min = row.cantidadMinimaAlerta;
    if (actual <= min) return 'crit';
    if (actual <= Math.ceil(min * 1.25)) return 'warn';
    return 'ok';
  }

  nivelStockLabel(nivel: 'ok' | 'warn' | 'crit'): string {
    if (nivel === 'ok') return 'Stock OK';
    if (nivel === 'warn') return 'Cerca del mínimo';
    return 'Reorden';
  }

  setFiltroMarca(v: string): void {
    this.filtroMarca.set(v || null);
  }

  setFiltroCategoria(v: string): void {
    this.filtroCategoria.set(v || null);
  }

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
        if (this.vista() === 'repuestos') {
          this.reloadStock();
        } else {
          this.reloadMaquinas();
        }
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
    this.reloadMaquinas();
  }

  setVista(v: VistaBodega): void {
    this.vista.set(v);
    this.filtroBusqueda.set('');
    if (v === 'repuestos') {
      this.reloadStock();
    } else {
      this.reloadMaquinas();
    }
  }

  private reloadMaquinas(): void {
    this.maquinasLoading.set(true);
    this.inventario
      .listMaquinasBodega(this.filtroBusqueda() || undefined)
      .subscribe({
        next: (rows) => {
          this.maquinas.set(rows);
          this.maquinasLoading.set(false);
        },
        error: () => {
          this.maquinas.set([]);
          this.maquinasLoading.set(false);
          this.toast.error('Error al cargar máquinas en bodega');
        },
      });
  }

  toggleVentaMaquina(m: BodegaMaquina): void {
    const nuevo = !m.aptoParaVenta;
    this.guardarVentaMaquina(m, nuevo, m.precioVentaClp);
  }

  onPrecioMaquinaChange(m: BodegaMaquina, raw: string): void {
    const precio = Math.max(0, Number(raw) || 0);
    this.maquinas.update((list) =>
      list.map((row) => (row.id === m.id ? { ...row, precioVentaClp: precio } : row)),
    );
  }

  guardarPrecioMaquina(m: BodegaMaquina): void {
    this.guardarVentaMaquina(m, m.aptoParaVenta, m.precioVentaClp);
  }

  private guardarVentaMaquina(
    m: BodegaMaquina,
    aptoParaVenta: boolean,
    precioVentaClp: number,
  ): void {
    if (aptoParaVenta && precioVentaClp <= 0) {
      this.toast.error('Indique un precio de venta mayor a 0 para habilitar');
      return;
    }

    this.maquinaVentaSavingId.set(m.id);
    this.inventario
      .updateMaquinaVentaComercial(m.id, {
        aptoParaVenta,
        precioVentaClp,
      })
      .subscribe({
        next: (updated) => {
          this.maquinaVentaSavingId.set(null);
          this.maquinas.update((list) =>
            list.map((row) => (row.id === updated.id ? updated : row)),
          );
          this.toast.success(
            aptoParaVenta
              ? `${updated.nombre} habilitada para venta`
              : `${updated.nombre} ya no está a la venta`,
          );
        },
        error: (err) => {
          this.maquinaVentaSavingId.set(null);
          const msg = err?.error?.message;
          this.toast.error(
            typeof msg === 'string'
              ? msg
              : Array.isArray(msg)
                ? msg[0]
                : 'No se pudo actualizar la venta',
          );
          this.reloadMaquinas();
        },
      });
  }

  puedeEditarVenta(m: BodegaMaquina): boolean {
    return (
      m.estadoOperacional !== 'reservado_venta' &&
      m.estadoOperacional !== 'vendido'
    );
  }

  estadoMaquinaLabel(estado: string): string {
    const map: Record<string, string> = {
      operativo: 'Operativo',
      reservado_venta: 'Reservada venta',
      fuera_servicio: 'Fuera de servicio',
      vendido: 'Vendida',
    };
    return map[estado] ?? estado;
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

  async softDeleteRepuesto(row: BodegaStockRow): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Descontinuar repuesto',
      message: `¿Descontinuar «${row.repuesto.nombre}» del catálogo? El historial Kardex se conservará.`,
      confirmLabel: 'Descontinuar',
      variant: 'danger',
    });
    if (!ok) return;
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
