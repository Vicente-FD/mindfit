import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { QRCodeComponent } from 'angularx-qrcode';
import { ActivosService, Activo } from '../../../core/services/activos.service';
import { SucursalesService } from '../../../core/services/sucursales.service';
import { ToastService } from '../../../core/services/toast.service';
import { CATEGORIAS_ACTIVO } from '../../../core/models/analytics.model';
import { Sucursal } from '../../../core/models/sucursal.model';

@Component({
  selector: 'app-activos-registro',
  imports: [ReactiveFormsModule, QRCodeComponent],
  templateUrl: './activos-registro.component.html',
  styleUrl: './activos-registro.component.css',
})
export class ActivosRegistroComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly activosService = inject(ActivosService);
  private readonly sucursalesService = inject(SucursalesService);
  private readonly toast = inject(ToastService);

  readonly categorias = CATEGORIAS_ACTIVO;
  readonly sucursales = signal<Sucursal[]>([]);
  readonly activos = signal<Activo[]>([]);
  readonly selectedActivo = signal<Activo | null>(null);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    marca: [''],
    modelo: [''],
    numeroSerie: [''],
    categoria: ['cardio' as const, Validators.required],
    sucursalId: ['', Validators.required],
    fechaCompra: [''],
    fechaVencimientoGarantia: [''],
    costoAdquisicion: [null as number | null],
  });

  ngOnInit(): void {
    this.sucursalesService.list().subscribe({
      next: (s) => this.sucursales.set(s),
    });
    this.loadActivos();
  }

  loadActivos(): void {
    this.activosService.list().subscribe({
      next: (a) => this.activos.set(a),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.activosService
      .create({
        nombre: v.nombre,
        marca: v.marca || undefined,
        modelo: v.modelo || undefined,
        numeroSerie: v.numeroSerie || undefined,
        categoria: v.categoria,
        sucursalId: Number(v.sucursalId),
        fechaCompra: v.fechaCompra || undefined,
        fechaVencimientoGarantia: v.fechaVencimientoGarantia || undefined,
        costoAdquisicion: v.costoAdquisicion ?? undefined,
      })
      .subscribe({
        next: (activo) => {
          this.saving.set(false);
          this.toast.success('Activo registrado');
          this.selectedActivo.set(activo);
          this.loadActivos();
          this.form.reset({
            nombre: '',
            marca: '',
            modelo: '',
            numeroSerie: '',
            categoria: 'cardio',
            sucursalId: '',
            fechaCompra: '',
            fechaVencimientoGarantia: '',
            costoAdquisicion: null,
          });
        },
        error: (err) => {
          this.saving.set(false);
          const msg = err?.error?.message ?? 'Error al registrar activo';
          this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
        },
      });
  }

  selectForQr(activo: Activo): void {
    this.selectedActivo.set(activo);
  }

  scanUrl(activo: Activo): string {
    const token = activo.codigoQrToken || activo.uuidActivo;
    return `${window.location.origin}/dashboard/tecnico?scan=${encodeURIComponent(token)}`;
  }

  serialLabel(activo: Activo): string {
    return activo.numeroSerie ?? activo.codigoQrToken.slice(0, 12).toUpperCase();
  }

  printFicha(): void {
    window.print();
  }
}
