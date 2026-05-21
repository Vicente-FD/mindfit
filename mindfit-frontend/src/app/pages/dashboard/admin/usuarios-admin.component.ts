import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { switchMap, of } from 'rxjs';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { SucursalesService } from '../../../core/services/sucursales.service';
import { ToastService } from '../../../core/services/toast.service';
import { Usuario, PermisosUi } from '../../../core/models/usuario.model';
import { UserRole, EstadoSesion } from '../../../core/models/user.model';
import { Sucursal, CASA_CENTRAL_VALUE } from '../../../core/models/sucursal.model';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Super Admin' },
  { value: 'jefe_operaciones', label: 'Jefe Operaciones' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'jefe_sucursal', label: 'Jefe Sucursal' },
  { value: 'gerente_bi', label: 'Gerente / BI' },
];

const ROLE_TABS: { value: UserRole | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'admin', label: 'Admin' },
  { value: 'jefe_operaciones', label: 'Operaciones' },
  { value: 'tecnico', label: 'Técnicos' },
  { value: 'jefe_sucursal', label: 'Jefes Sucursal' },
  { value: 'gerente_bi', label: 'Ejecutivos' },
];

const PERMISO_LABELS: { key: keyof PermisosUi; label: string }[] = [
  { key: 'verDashboardEjecutivo', label: 'Dashboard ejecutivo' },
  { key: 'verGestionActivos', label: 'Gestión de activos' },
  { key: 'verGestionUsuarios', label: 'Gestión de usuarios' },
  { key: 'verAsignacionOt', label: 'Asignación de OTs' },
  { key: 'verReportesSucursal', label: 'Reportes sucursal' },
  { key: 'generarQrActivos', label: 'Generar QR de activos' },
];

const PERMISOS_DEFAULTS: PermisosUi = {
  verDashboardEjecutivo: false,
  verGestionActivos: true,
  verGestionUsuarios: false,
  verAsignacionOt: true,
  verReportesSucursal: true,
  generarQrActivos: false,
};

@Component({
  selector: 'app-usuarios-admin',
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './usuarios-admin.component.html',
  styleUrl: './usuarios-admin.component.css',
})
export class UsuariosAdminComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly usuariosService = inject(UsuariosService);
  private readonly sucursalesService = inject(SucursalesService);
  private readonly toast = inject(ToastService);

  readonly casaCentral = CASA_CENTRAL_VALUE;
  readonly roles = ROLES;
  readonly roleTabs = ROLE_TABS;
  readonly permisoLabels = PERMISO_LABELS;
  readonly usuarios = signal<Usuario[]>([]);
  readonly sucursales = signal<Sucursal[]>([]);
  readonly selected = signal<Usuario | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly showForm = signal(false);
  readonly activeRoleTab = signal<UserRole | 'todos'>('todos');

  readonly createForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    nombre: ['', Validators.required],
    rol: ['tecnico' as UserRole, Validators.required],
    sucursalId: [CASA_CENTRAL_VALUE as string | number],
    telefono: [''],
  });

  readonly editForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    rol: ['tecnico' as UserRole, Validators.required],
    sucursalId: [CASA_CENTRAL_VALUE as string | number],
    telefono: [''],
    estaActivo: [true],
    nuevaPassword: [''],
  });

  readonly permisosForm = this.fb.group({
    verDashboardEjecutivo: [PERMISOS_DEFAULTS.verDashboardEjecutivo],
    verGestionActivos: [PERMISOS_DEFAULTS.verGestionActivos],
    verGestionUsuarios: [PERMISOS_DEFAULTS.verGestionUsuarios],
    verAsignacionOt: [PERMISOS_DEFAULTS.verAsignacionOt],
    verReportesSucursal: [PERMISOS_DEFAULTS.verReportesSucursal],
    generarQrActivos: [PERMISOS_DEFAULTS.generarQrActivos],
  });

  readonly needsSucursal = computed(
    () => this.createForm.controls.rol.value === 'jefe_sucursal',
  );

  readonly needsSucursalEdit = computed(
    () => this.editForm.controls.rol.value === 'jefe_sucursal',
  );

  private refreshIntervalId: ReturnType<typeof setInterval> | null = null;

  readonly filteredUsuarios = computed(() => {
    const tab = this.activeRoleTab();
    const list = this.usuarios();
    if (tab === 'todos') return list;
    return list.filter((u) => u.rol === tab);
  });

  ngOnInit(): void {
    this.load();
    this.sucursalesService.list().subscribe({
      next: (s) => this.sucursales.set(s),
    });
    this.refreshIntervalId = setInterval(() => this.load(true), 30_000);
  }

  ngOnDestroy(): void {
    if (this.refreshIntervalId != null) {
      clearInterval(this.refreshIntervalId);
    }
  }

  load(silent = false): void {
    if (!silent) this.loading.set(true);
    this.usuariosService.list().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        const sel = this.selected();
        if (sel) {
          const updated = data.find((u) => u.id === sel.id);
          if (updated) this.selected.set(updated);
        }
        if (!silent) this.loading.set(false);
      },
      error: () => {
        if (!silent) {
          this.loading.set(false);
          this.toast.error('Error al cargar usuarios');
        }
      },
    });
  }

  toggleForm(): void {
    this.showForm.update((v) => {
      const next = !v;
      if (next) {
        this.selected.set(null);
        this.resetPermisosDefaults();
      }
      return next;
    });
  }

  permisoActivo(key: keyof PermisosUi): boolean {
    return !!this.permisosForm.get(key)?.value;
  }

  permisoChipClass(key: keyof PermisosUi): string {
    return this.permisoActivo(key)
      ? 'perm-chip perm-chip--active'
      : 'perm-chip perm-chip--inactive';
  }

  private resetPermisosDefaults(): void {
    this.permisosForm.patchValue(PERMISOS_DEFAULTS);
  }

  setRoleTab(tab: UserRole | 'todos'): void {
    this.activeRoleTab.set(tab);
  }

  private parseSucursalId(
    rol: UserRole,
    raw: string | number,
  ): number | null | undefined {
    if (rol !== 'jefe_sucursal') {
      return raw === CASA_CENTRAL_VALUE || raw === '' || raw == null
        ? null
        : Number(raw);
    }
    if (raw === CASA_CENTRAL_VALUE || raw === '' || raw == null) {
      return undefined;
    }
    return Number(raw);
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const v = this.createForm.getRawValue();
    const sucursalId = this.parseSucursalId(v.rol, v.sucursalId);
    if (v.rol === 'jefe_sucursal' && sucursalId === undefined) {
      this.toast.error('Jefe de sucursal requiere una sede asignada');
      return;
    }

    const permisosUi = this.permisosForm.getRawValue() as PermisosUi;

    this.usuariosService
      .create({
        email: v.email,
        password: v.password,
        nombre: v.nombre,
        rol: v.rol,
        sucursalId: sucursalId ?? null,
        telefono: v.telefono || undefined,
        permisosUi,
      })
      .subscribe({
        next: () => {
          this.toast.success('Usuario creado');
          this.createForm.reset({
            email: '',
            password: '',
            nombre: '',
            rol: 'tecnico',
            sucursalId: CASA_CENTRAL_VALUE,
            telefono: '',
          });
          this.resetPermisosDefaults();
          this.showForm.set(false);
          this.load();
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'No se pudo crear el usuario';
          this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
        },
      });
  }

  selectUsuario(u: Usuario): void {
    this.showForm.set(false);
    this.selected.set(u);
    this.editForm.patchValue({
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      sucursalId: (u.sucursalId ?? CASA_CENTRAL_VALUE) as string | number,
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

    const sucursalId = this.parseSucursalId(v.rol, v.sucursalId);
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
          if (!pwd) return of(updated);
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

  onToggleActivo(u: Usuario, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.usuariosService.update(u.id, { estaActivo: checked }).subscribe({
      next: (updated) => {
        this.toast.success(checked ? 'Usuario activado' : 'Usuario desactivado');
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

  sedeLabel(u: Usuario): string {
    if (!u.sucursalId) return 'Casa Central';
    return u.sucursal?.nombre ?? `Sede #${u.sucursalId}`;
  }

  sessionClass(estado?: EstadoSesion): string {
    if (estado === 'conectado') return 'session-online';
    if (estado === 'reposo') return 'session-reposo';
    return 'session-offline';
  }

  sessionIcon(estado?: EstadoSesion): string {
    if (estado === 'reposo') return '🌙';
    return '';
  }
}
