import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { forkJoin } from 'rxjs';
import { VehiculosService } from '../../../core/services/vehiculos.service';
import { LicenciasService } from '../../../core/services/licencias.service';
import { SucursalesService } from '../../../core/services/sucursales.service';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { ToastService } from '../../../core/services/toast.service';
import { ImageCompressorService } from '../../../core/services/image-compressor.service';
import { resolveMediaUrl } from '../../../core/utils/media-url';
import {
  LicenciaPanelRow,
  Vehiculo,
} from '../../../core/models/flota.model';
import { Sucursal, CASA_CENTRAL_VALUE } from '../../../core/models/sucursal.model';
import { Usuario } from '../../../core/models/usuario.model';
import { MindfitDatePickerComponent } from '../../../common/components/date-picker/date-picker.component';
import {
  alertasVehiculo,
  alertaAceite,
  alertaDocumento,
  estadoVencimiento,
  formatFechaCl,
  toIsoDateOnly,
} from '../../../core/utils/flota-alertas.util';

type TabId = 'vehiculos' | 'licencias';

const TIPOS_LICENCIA = ['Clase B', 'Clase A2', 'Clase A3', 'Clase A4', 'Clase A5'];

@Component({
  selector: 'app-flota-dashboard',
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    LucideAngularModule,
    MindfitDatePickerComponent,
  ],
  templateUrl: './flota-dashboard.component.html',
  styleUrl: './flota-dashboard.component.css',
})
export class FlotaDashboardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly vehiculosApi = inject(VehiculosService);
  private readonly licenciasApi = inject(LicenciasService);
  private readonly sucursalesApi = inject(SucursalesService);
  private readonly usuariosApi = inject(UsuariosService);
  private readonly toast = inject(ToastService);
  private readonly compressor = inject(ImageCompressorService);

  readonly casaCentral = CASA_CENTRAL_VALUE;
  readonly tiposLicencia = TIPOS_LICENCIA;
  readonly formatFecha = formatFechaCl;
  readonly estadoVencimiento = estadoVencimiento;

  readonly tab = signal<TabId>('vehiculos');
  readonly loading = signal(true);
  readonly savingVehiculo = signal(false);
  readonly savingVehiculoEdit = signal(false);
  readonly showVehiculoForm = signal(false);
  readonly vehiculoEdit = signal<Vehiculo | null>(null);
  readonly vehiculos = signal<Vehiculo[]>([]);
  readonly alertasCount = signal(0);
  readonly sucursales = signal<Sucursal[]>([]);
  readonly tecnicos = signal<Usuario[]>([]);
  readonly panelLicencias = signal<LicenciaPanelRow[]>([]);
  readonly licenciaEdit = signal<LicenciaPanelRow | null>(null);
  readonly savingLicencia = signal(false);
  readonly previewDocumento = signal<string | null>(null);
  readonly documentoNombre = signal<string | null>(null);
  readonly documentoEsPdf = signal(false);

  private licenciaDocumentoFile: File | null = null;

  readonly vehiculoForm = this.fb.nonNullable.group({
    patente: ['', [Validators.required, Validators.maxLength(15)]],
    marca: ['', [Validators.required, Validators.maxLength(100)]],
    modelo: ['', [Validators.required, Validators.maxLength(100)]],
    anio: [new Date().getFullYear(), [Validators.required, Validators.min(1990)]],
    kilometrajeActual: [0, [Validators.required, Validators.min(0)]],
    siguienteCambioAceiteKm: [10_000, [Validators.required, Validators.min(0)]],
    sucursalId: [CASA_CENTRAL_VALUE as string | number],
    conductorId: ['' as string | number],
    vencimientoSoap: ['', Validators.required],
    vencimientoPermiso: ['', Validators.required],
    vencimientoRevision: ['', Validators.required],
  });

  readonly licenciaForm = this.fb.nonNullable.group({
    tipoLicencia: ['Clase B', Validators.required],
    fechaVencimiento: ['', Validators.required],
  });

  readonly vehiculoEditForm = this.fb.nonNullable.group({
    kilometrajeActual: [0, [Validators.required, Validators.min(0)]],
    siguienteCambioAceiteKm: [10_000, [Validators.required, Validators.min(0)]],
    sucursalId: [CASA_CENTRAL_VALUE as string | number],
    conductorId: ['' as string | number],
    vencimientoSoap: ['', Validators.required],
    vencimientoPermiso: ['', Validators.required],
    vencimientoRevision: ['', Validators.required],
  });

  ngOnInit(): void {
    this.load();
  }

  setTab(id: TabId): void {
    this.tab.set(id);
  }

  load(): void {
    this.loading.set(true);
    forkJoin({
      vehiculos: this.vehiculosApi.list(),
      alertas: this.vehiculosApi.alertas(),
      sucursales: this.sucursalesApi.list(),
      usuarios: this.usuariosApi.list(),
      panel: this.licenciasApi.panel(),
    }).subscribe({
      next: ({ vehiculos, alertas, sucursales, usuarios, panel }) => {
        this.vehiculos.set(vehiculos);
        this.alertasCount.set(alertas.length);
        this.sucursales.set(sucursales);
        this.tecnicos.set(usuarios.filter((u) => u.rol === 'tecnico' && u.estaActivo));
        this.panelLicencias.set(panel);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('No se pudo cargar el control de flota');
      },
    });
  }

  toggleVehiculoForm(): void {
    this.showVehiculoForm.update((v) => !v);
    if (!this.showVehiculoForm()) {
      this.vehiculoForm.reset({
        patente: '',
        marca: '',
        modelo: '',
        anio: new Date().getFullYear(),
        kilometrajeActual: 0,
        siguienteCambioAceiteKm: 10_000,
        sucursalId: CASA_CENTRAL_VALUE,
        conductorId: '',
        vencimientoSoap: '',
        vencimientoPermiso: '',
        vencimientoRevision: '',
      });
    }
  }

  alertasVehiculo(v: Vehiculo) {
    return alertasVehiculo(v);
  }

  docAlerta(fecha: string): boolean {
    return alertaDocumento(fecha);
  }

  aceiteAlerta(v: Vehiculo): boolean {
    return alertaAceite(v.kilometrajeActual, v.siguienteCambioAceiteKm);
  }

  sucursalLabel(v: Vehiculo): string {
    if (!v.sucursalId) return 'Casa Central';
    return v.sucursal?.nombre ?? `Sede #${v.sucursalId}`;
  }

  kmRestantesAceite(v: Vehiculo): number {
    return v.siguienteCambioAceiteKm - v.kilometrajeActual;
  }

  private resolveSucursalId(raw: string | number): number | null {
    if (raw === CASA_CENTRAL_VALUE || raw === '' || raw == null) return null;
    return Number(raw);
  }

  private resolveConductorId(raw: string | number): number | null {
    if (raw === '' || raw == null) return null;
    return Number(raw);
  }

  submitVehiculo(): void {
    if (this.vehiculoForm.invalid) {
      this.vehiculoForm.markAllAsTouched();
      return;
    }
    const raw = this.vehiculoForm.getRawValue();
    this.savingVehiculo.set(true);
    this.vehiculosApi
      .create({
        patente: raw.patente.trim().toUpperCase(),
        marca: raw.marca.trim(),
        modelo: raw.modelo.trim(),
        anio: Number(raw.anio),
        kilometrajeActual: Number(raw.kilometrajeActual),
        siguienteCambioAceiteKm: Number(raw.siguienteCambioAceiteKm),
        sucursalId: this.resolveSucursalId(raw.sucursalId),
        conductorId: this.resolveConductorId(raw.conductorId),
        vencimientoSoap: raw.vencimientoSoap,
        vencimientoPermiso: raw.vencimientoPermiso,
        vencimientoRevision: raw.vencimientoRevision,
      })
      .subscribe({
        next: () => {
          this.savingVehiculo.set(false);
          this.toast.success('Vehículo registrado');
          this.showVehiculoForm.set(false);
          this.load();
        },
        error: (err) => {
          this.savingVehiculo.set(false);
          const msg =
            err?.error?.message ?? 'No se pudo registrar el vehículo';
          this.toast.error(Array.isArray(msg) ? msg[0] : msg);
        },
      });
  }

  eliminarVehiculo(v: Vehiculo): void {
    if (!confirm(`¿Eliminar vehículo ${v.patente}?`)) return;
    this.vehiculosApi.remove(v.id).subscribe({
      next: () => {
        this.toast.success('Vehículo eliminado');
        this.load();
      },
      error: () => this.toast.error('No se pudo eliminar el vehículo'),
    });
  }

  openVehiculoEdit(v: Vehiculo): void {
    this.vehiculoEdit.set(v);
    this.vehiculoEditForm.reset({
      kilometrajeActual: v.kilometrajeActual,
      siguienteCambioAceiteKm: v.siguienteCambioAceiteKm,
      sucursalId: v.sucursalId ?? CASA_CENTRAL_VALUE,
      conductorId: v.conductorId ?? '',
      vencimientoSoap: toIsoDateOnly(v.vencimientoSoap),
      vencimientoPermiso: toIsoDateOnly(v.vencimientoPermiso),
      vencimientoRevision: toIsoDateOnly(v.vencimientoRevision),
    });
  }

  closeVehiculoEdit(): void {
    this.vehiculoEdit.set(null);
  }

  submitVehiculoEdit(): void {
    const v = this.vehiculoEdit();
    if (!v || this.vehiculoEditForm.invalid) {
      this.vehiculoEditForm.markAllAsTouched();
      return;
    }

    const raw = this.vehiculoEditForm.getRawValue();
    this.savingVehiculoEdit.set(true);

    this.vehiculosApi
      .update(v.id, {
        kilometrajeActual: Number(raw.kilometrajeActual),
        siguienteCambioAceiteKm: Number(raw.siguienteCambioAceiteKm),
        sucursalId: this.resolveSucursalId(raw.sucursalId),
        conductorId: this.resolveConductorId(raw.conductorId),
        vencimientoSoap: raw.vencimientoSoap,
        vencimientoPermiso: raw.vencimientoPermiso,
        vencimientoRevision: raw.vencimientoRevision,
      })
      .subscribe({
        next: () => {
          this.savingVehiculoEdit.set(false);
          this.toast.success('Vehículo actualizado');
          this.closeVehiculoEdit();
          this.load();
        },
        error: (err) => {
          this.savingVehiculoEdit.set(false);
          const msg =
            err?.error?.message ?? 'No se pudo actualizar el vehículo';
          this.toast.error(Array.isArray(msg) ? msg[0] : msg);
        },
      });
  }

  openLicenciaEdit(row: LicenciaPanelRow): void {
    this.revokeDocumentoPreview();
    this.licenciaDocumentoFile = null;
    this.documentoNombre.set(null);
    this.documentoEsPdf.set(false);
    this.licenciaEdit.set(row);
    this.licenciaForm.reset({
      tipoLicencia: row.tipoLicencia ?? 'Clase B',
      fechaVencimiento: row.fechaVencimiento ?? '',
    });
    if (row.documentoUrl) {
      const esPdf = row.documentoUrl.toLowerCase().includes('.pdf');
      this.documentoEsPdf.set(esPdf);
      if (!esPdf) {
        this.previewDocumento.set(resolveMediaUrl(row.documentoUrl));
      } else {
        this.documentoNombre.set('Documento actual (PDF)');
      }
    }
  }

  closeLicenciaEdit(): void {
    this.revokeDocumentoPreview();
    this.licenciaDocumentoFile = null;
    this.licenciaEdit.set(null);
  }

  puedeGuardarLicencia(): boolean {
    const row = this.licenciaEdit();
    if (!row || this.licenciaForm.invalid || this.savingLicencia()) {
      return false;
    }
    if (row.licenciaId) return true;
    return !!this.licenciaDocumentoFile;
  }

  async onDocumentoLicenciaSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const allowed =
      file.type === 'application/pdf' || file.type.startsWith('image/');
    if (!allowed) {
      this.toast.error('Use un archivo PDF o imagen (JPG, PNG, WEBP)');
      input.value = '';
      return;
    }

    try {
      this.revokeDocumentoPreview();
      const esPdf = file.type === 'application/pdf';
      this.documentoEsPdf.set(esPdf);

      if (esPdf) {
        this.licenciaDocumentoFile = file;
        this.documentoNombre.set(file.name);
        this.previewDocumento.set(null);
      } else {
        const compressed = await this.compressor.compress(file);
        this.licenciaDocumentoFile = compressed;
        this.documentoNombre.set(compressed.name);
        this.previewDocumento.set(URL.createObjectURL(compressed));
      }
    } catch {
      this.toast.error('No se pudo procesar el archivo de la licencia');
    }
    input.value = '';
  }

  verDocumento(url: string | null): void {
    if (!url) {
      this.toast.error('Sin documento digitalizado');
      return;
    }
    window.open(resolveMediaUrl(url), '_blank', 'noopener,noreferrer');
  }

  submitLicencia(): void {
    const row = this.licenciaEdit();
    if (!row || !this.puedeGuardarLicencia()) {
      this.licenciaForm.markAllAsTouched();
      if (!this.licenciaDocumentoFile && !row?.licenciaId) {
        this.toast.error('Debe adjuntar el documento de la licencia');
      }
      return;
    }

    const raw = this.licenciaForm.getRawValue();
    const fd = new FormData();
    fd.append('tipoLicencia', raw.tipoLicencia);
    fd.append('fechaVencimiento', raw.fechaVencimiento);

    if (this.licenciaDocumentoFile) {
      fd.append(
        'documento',
        this.licenciaDocumentoFile,
        this.licenciaDocumentoFile.name,
      );
    }

    if (!row.licenciaId) {
      fd.append('tecnicoId', String(row.tecnicoId));
    }

    this.savingLicencia.set(true);

    const req = row.licenciaId
      ? this.licenciasApi.updateWithDocument(row.licenciaId, fd)
      : this.licenciasApi.createWithDocument(fd);

    req.subscribe({
      next: () => {
        this.savingLicencia.set(false);
        this.toast.success('Licencia guardada');
        this.closeLicenciaEdit();
        this.load();
      },
      error: (err) => {
        this.savingLicencia.set(false);
        const msg = err?.error?.message ?? 'No se pudo guardar la licencia';
        this.toast.error(Array.isArray(msg) ? msg[0] : msg);
      },
    });
  }

  private revokeDocumentoPreview(): void {
    const url = this.previewDocumento();
    if (url?.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
    this.previewDocumento.set(null);
  }
}
