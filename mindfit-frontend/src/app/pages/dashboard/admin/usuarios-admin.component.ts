import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { switchMap, of } from 'rxjs';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { SucursalesService } from '../../../core/services/sucursales.service';
import { ToastService } from '../../../core/services/toast.service';
import { Usuario, PermisosUi } from '../../../core/models/usuario.model';
import { UserRole } from '../../../core/models/user.model';
import { Sucursal } from '../../../core/models/sucursal.model';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Super Admin' },
  { value: 'jefe_operaciones', label: 'Jefe Operaciones' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'jefe_sucursal', label: 'Jefe Sucursal' },
  { value: 'gerente_bi', label: 'Gerente / BI' },
];

const PERMISO_LABELS: { key: keyof PermisosUi; label: string }[] = [
  { key: 'verDashboardEjecutivo', label: 'Dashboard ejecutivo' },
  { key: 'verGestionActivos', label: 'Gestión de activos' },
  { key: 'verGestionUsuarios', label: 'Gestión de usuarios' },
  { key: 'verAsignacionOt', label: 'Asignación de OTs' },
  { key: 'verReportesSucursal', label: 'Reportes sucursal' },
  { key: 'generarQrActivos', label: 'Generar QR de activos' },
];

@Component({
  selector: 'app-usuarios-admin',
  imports: [ReactiveFormsModule],
  templateUrl: './usuarios-admin.component.html',
  styleUrl: './usuarios-admin.component.css',
})
export class UsuariosAdminComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuariosService = inject(UsuariosService);
  private readonly sucursalesService = inject(SucursalesService);
  private readonly toast = inject(ToastService);

  readonly roles = ROLES;
  readonly permisoLabels = PERMISO_LABELS;
  readonly usuarios = signal<Usuario[]>([]);
  readonly sucursales = signal<Sucursal[]>([]);
  readonly selected = signal<Usuario | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly showCreate = signal(false);

  readonly createForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    nombre: ['', Validators.required],
    rol: ['tecnico' as UserRole, Validators.required],
    sucursalId: ['' as number | ''],
    telefono: [''],
  });

  readonly editForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    rol: ['tecnico' as UserRole, Validators.required],
    sucursalId: ['' as number | ''],
    telefono: [''],
    estaActivo: [true],
    nuevaPassword: [''],
  });

  readonly permisosForm = this.fb.group({
    verDashboardEjecutivo: [false],
    verGestionActivos: [true],
    verGestionUsuarios: [false],
    verAsignacionOt: [true],
    verReportesSucursal: [true],
    generarQrActivos: [false],
  });

  readonly needsSucursal = computed(
    () => this.createForm.controls.rol.value === 'jefe_sucursal',
  );

  readonly needsSucursalEdit = computed(
    () => this.editForm.controls.rol.value === 'jefe_sucursal',
  );

  ngOnInit(): void {
    this.load();
    this.sucursalesService.list().subscribe({
      next: (s) => this.sucursales.set(s),
    });
  }

  load(): void {
    this.loading.set(true);
    this.usuariosService.list().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Error al cargar usuarios');
      },
    });
  }

  toggleCreate(): void {
    this.showCreate.update((v) => !v);
  }

  private resolveSucursalId(
    rol: UserRole,
    sucursalId: number | '',
  ): number | null | undefined {
    if (rol !== 'jefe_sucursal') {
      return null;
    }
    if (sucursalId === '' || sucursalId == null) {
      return undefined;
    }
    return Number(sucursalId);
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const v = this.createForm.getRawValue();
    const sucursalId = this.resolveSucursalId(v.rol, v.sucursalId);
    if (v.rol === 'jefe_sucursal' && sucursalId === undefined) {
      this.toast.error('Jefe de sucursal requiere una sede asignada');
      return;
    }

    this.usuariosService
      .create({
        email: v.email,
        password: v.password,
        nombre: v.nombre,
        rol: v.rol,
        sucursalId: sucursalId ?? undefined,
        telefono: v.telefono || undefined,
      })
      .subscribe({
        next: () => {
          this.toast.success('Usuario creado');
          this.createForm.reset({
            email: '',
            password: '',
            nombre: '',
            rol: 'tecnico',
            sucursalId: '',
            telefono: '',
          });
          this.showCreate.set(false);
          this.load();
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'No se pudo crear el usuario';
          this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
        },
      });
  }

  selectUsuario(u: Usuario): void {
    this.showCreate.set(false);
    this.selected.set(u);
    this.editForm.patchValue({
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      sucursalId: u.sucursalId ?? '',
      telefono: u.telefono ?? '',
      estaActivo: u.estaActivo,
      nuevaPassword: '',
    });
    const p = u.permisosUi ?? {};
    this.permisosForm.patchValue({
      verDashboardEjecutivo: p.verDashboardEjecutivo ?? false,
      verGestionActivos: p.verGestionActivos ?? true,
      verGestionUsuarios: p.verGestionUsuarios ?? false,
      verAsignacionOt: p.verAsignacionOt ?? true,
      verReportesSucursal: p.verReportesSucursal ?? true,
      generarQrActivos: p.generarQrActivos ?? false,
    });
  }

  submitEdit(): void {
    const u = this.selected();
    if (!u || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const v = this.editForm.getRawValue();
    if (v.nuevaPassword && v.nuevaPassword.length < 8) {
      this.toast.error('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    const sucursalId = this.resolveSucursalId(v.rol, v.sucursalId);
    if (v.rol === 'jefe_sucursal' && sucursalId === undefined) {
      this.toast.error('Jefe de sucursal requiere una sede asignada');
      return;
    }

    const permisosUi = this.permisosForm.getRawValue() as PermisosUi;
    this.saving.set(true);

    this.usuariosService
      .update(u.id, {
        nombre: v.nombre,
        email: v.email,
        rol: v.rol,
        sucursalId: sucursalId ?? null,
        telefono: v.telefono || null,
        estaActivo: v.estaActivo,
        permisosUi,
      })
      .pipe(
        switchMap((updated) => {
          const pwd = v.nuevaPassword?.trim();
          if (!pwd) {
            return of(updated);
          }
          return this.usuariosService
            .updatePassword(u.id, pwd)
            .pipe(switchMap(() => of(updated)));
        }),
      )
      .subscribe({
        next: (updated) => {
          this.saving.set(false);
          this.toast.success('Usuario actualizado');
          this.selected.set(updated);
          this.editForm.patchValue({ nuevaPassword: '' });
          this.load();
        },
        error: (err) => {
          this.saving.set(false);
          const msg = err?.error?.message ?? 'No se pudo actualizar el usuario';
          this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
        },
      });
  }

  savePermisos(): void {
    this.submitEdit();
  }

  toggleActivo(u: Usuario): void {
    this.usuariosService.update(u.id, { estaActivo: !u.estaActivo }).subscribe({
      next: (updated) => {
        this.toast.success(u.estaActivo ? 'Usuario desactivado' : 'Usuario activado');
        if (this.selected()?.id === u.id) {
          this.selected.set(updated);
          this.editForm.patchValue({ estaActivo: updated.estaActivo });
        }
        this.load();
      },
      error: () => this.toast.error('Error al actualizar estado'),
    });
  }

  deactivate(u: Usuario): void {
    if (!confirm(`¿Dar de baja a ${u.nombre}?`)) return;
    this.usuariosService.deactivate(u.id).subscribe({
      next: () => {
        this.toast.success('Usuario dado de baja');
        if (this.selected()?.id === u.id) this.selected.set(null);
        this.load();
      },
      error: () => this.toast.error('Error al dar de baja'),
    });
  }

  rolLabel(rol: UserRole): string {
    return ROLES.find((r) => r.value === rol)?.label ?? rol;
  }
}
