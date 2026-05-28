import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { CategoriasService } from '../../../core/services/categorias.service';
import { MarcasService } from '../../../core/services/marcas.service';
import { Sucursal } from '../../../core/models/sucursal.model';
import { SucursalesService } from '../../../core/services/sucursales.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';
import { FacilidadesSucursalPanelComponent } from '../../../shared/facilidades-sucursal-panel/facilidades-sucursal-panel.component';
import { Categoria } from '../../../core/models/categoria.model';
import { Marca } from '../../../core/models/marca.model';

const SIGLA_PATTERN = /^[A-Z]{2,5}$/;

@Component({
  selector: 'app-parametros-admin',
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    FacilidadesSucursalPanelComponent,
  ],
  templateUrl: './parametros-admin.component.html',
  styleUrl: './parametros-admin.component.css',
})
export class ParametrosAdminComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoriasService = inject(CategoriasService);
  private readonly marcasService = inject(MarcasService);
  private readonly sucursalesService = inject(SucursalesService);
  private readonly toast = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly categorias = signal<Categoria[]>([]);
  readonly marcas = signal<Marca[]>([]);
  readonly sucursales = signal<Sucursal[]>([]);
  readonly loadingCat = signal(false);
  readonly loadingMarca = signal(false);
  readonly loadingSucursales = signal(false);
  readonly savingCat = signal(false);
  readonly savingMarca = signal(false);
  readonly editingCategoria = signal<Categoria | null>(null);
  readonly editingMarca = signal<Marca | null>(null);
  readonly marcaLogoFile = signal<File | null>(null);
  readonly operatividadSucursalId = signal<number | null>(null);

  readonly categoriaForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    sigla: ['', [Validators.required, Validators.pattern(SIGLA_PATTERN)]],
  });

  readonly marcaForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    sigla: ['', [Validators.required, Validators.pattern(SIGLA_PATTERN)]],
  });

  ngOnInit(): void {
    this.reloadCategorias();
    this.reloadMarcas();
    this.reloadSucursales();
  }

  reloadSucursales(): void {
    this.loadingSucursales.set(true);
    this.sucursalesService.list().subscribe({
      next: (rows) => {
        this.sucursales.set(rows);
        this.loadingSucursales.set(false);
        if (rows.length > 0 && this.operatividadSucursalId() == null) {
          this.operatividadSucursalId.set(rows[0]!.id);
        }
      },
      error: () => {
        this.loadingSucursales.set(false);
        this.toast.error('No se pudieron cargar las sedes');
      },
    });
  }

  onChangeOperatividadSucursal(raw: string): void {
    const value = Number(raw);
    this.operatividadSucursalId.set(Number.isNaN(value) ? null : value);
  }

  reloadCategorias(): void {
    this.loadingCat.set(true);
    this.categoriasService.list().subscribe({
      next: (rows) => {
        this.categorias.set(rows);
        this.loadingCat.set(false);
      },
      error: () => {
        this.loadingCat.set(false);
        this.toast.error('No se pudieron cargar las categorías');
      },
    });
  }

  reloadMarcas(): void {
    this.loadingMarca.set(true);
    this.marcasService.list().subscribe({
      next: (rows) => {
        this.marcas.set(rows);
        this.loadingMarca.set(false);
      },
      error: () => {
        this.loadingMarca.set(false);
        this.toast.error('No se pudieron cargar las marcas');
      },
    });
  }

  onCategoriaSiglaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5);
    input.value = cleaned;
    this.categoriaForm.controls.sigla.setValue(cleaned);
  }

  onMarcaSiglaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5);
    input.value = cleaned;
    this.marcaForm.controls.sigla.setValue(cleaned);
  }

  openNewCategoria(): void {
    this.editingCategoria.set(null);
    this.categoriaForm.reset({ nombre: '', sigla: '' });
  }

  openEditCategoria(c: Categoria): void {
    this.editingCategoria.set(c);
    this.categoriaForm.patchValue({ nombre: c.nombre, sigla: c.sigla });
  }

  submitCategoria(): void {
    if (this.categoriaForm.invalid) {
      this.categoriaForm.markAllAsTouched();
      return;
    }
    const v = this.categoriaForm.getRawValue();
    const payload = {
      nombre: v.nombre.trim(),
      sigla: v.sigla.trim().toUpperCase(),
    };
    this.savingCat.set(true);
    const edit = this.editingCategoria();
    const req = edit
      ? this.categoriasService.update(edit.id, payload)
      : this.categoriasService.create(payload);

    req.subscribe({
      next: () => {
        this.savingCat.set(false);
        this.toast.success(edit ? 'Categoría actualizada' : 'Categoría creada');
        this.openNewCategoria();
        this.reloadCategorias();
      },
      error: (err) => {
        this.savingCat.set(false);
        const msg = err?.error?.message ?? 'Error al guardar categoría';
        this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
      },
    });
  }

  async deleteCategoria(c: Categoria): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Dar de baja familia',
      message: `¿Dar de baja la familia «${c.nombre}»?`,
      confirmLabel: 'Dar de baja',
      variant: 'danger',
    });
    if (!ok) return;
    this.categoriasService.remove(c.id).subscribe({
      next: () => {
        this.toast.success('Categoría dada de baja');
        if (this.editingCategoria()?.id === c.id) this.openNewCategoria();
        this.reloadCategorias();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'No se pudo dar de baja';
        this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
      },
    });
  }

  openNewMarca(): void {
    this.editingMarca.set(null);
    this.marcaLogoFile.set(null);
    this.marcaForm.reset({ nombre: '', sigla: '' });
  }

  openEditMarca(m: Marca): void {
    this.editingMarca.set(m);
    this.marcaLogoFile.set(null);
    this.marcaForm.patchValue({ nombre: m.nombre, sigla: m.sigla });
  }

  onMarcaLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.marcaLogoFile.set(file);
  }

  submitMarca(): void {
    if (this.marcaForm.invalid) {
      this.marcaForm.markAllAsTouched();
      return;
    }
    const v = this.marcaForm.getRawValue();
    const payload = {
      nombre: v.nombre.trim(),
      sigla: v.sigla.trim().toUpperCase(),
    };
    const logo = this.marcaLogoFile() ?? undefined;
    this.savingMarca.set(true);
    const edit = this.editingMarca();
    const req = edit
      ? this.marcasService.update(edit.id, payload, logo)
      : this.marcasService.create(payload, logo);

    req.subscribe({
      next: () => {
        this.savingMarca.set(false);
        this.toast.success(edit ? 'Marca actualizada' : 'Marca creada');
        this.openNewMarca();
        this.reloadMarcas();
      },
      error: (err) => {
        this.savingMarca.set(false);
        const msg = err?.error?.message ?? 'Error al guardar marca';
        this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
      },
    });
  }

  async deleteMarca(m: Marca): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: 'Dar de baja marca',
      message: `¿Dar de baja la marca «${m.nombre}»?`,
      confirmLabel: 'Dar de baja',
      variant: 'danger',
    });
    if (!ok) return;
    this.marcasService.remove(m.id).subscribe({
      next: () => {
        this.toast.success('Marca dada de baja');
        if (this.editingMarca()?.id === m.id) this.openNewMarca();
        this.reloadMarcas();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'No se pudo dar de baja';
        this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
      },
    });
  }
}
