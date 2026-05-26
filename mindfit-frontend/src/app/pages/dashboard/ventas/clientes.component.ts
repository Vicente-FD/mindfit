import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { VentasService } from '../../../core/services/ventas.service';
import { ToastService } from '../../../core/services/toast.service';
import { Cliente, CreateClientePayload } from '../../../core/models/ventas.model';

@Component({
  selector: 'app-clientes-ventas',
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css',
})
export class ClientesVentasComponent implements OnInit {
  private readonly ventas = inject(VentasService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly lista = signal<Cliente[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly editId = signal<number | null>(null);
  readonly showForm = signal(false);

  readonly form = this.fb.nonNullable.group({
    rut: ['', [Validators.required, Validators.maxLength(15)]],
    razonSocial: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    direccion: ['', Validators.required],
    comuna: ['', Validators.required],
    ciudad: ['', Validators.required],
  });

  ngOnInit(): void {
    this.load();
  }

  toggleForm(): void {
    const willShow = !this.showForm();
    this.showForm.set(willShow);
    if (willShow && !this.editId()) {
      this.form.reset({
        rut: '',
        razonSocial: '',
        email: '',
        telefono: '',
        direccion: '',
        comuna: '',
        ciudad: '',
      });
    }
    if (!willShow) {
      this.cancelEdit();
    }
  }

  startEdit(c: Cliente): void {
    this.editId.set(c.id);
    this.showForm.set(true);
    this.form.patchValue({
      rut: c.rut,
      razonSocial: c.razonSocial,
      email: c.email,
      telefono: c.telefono ?? '',
      direccion: c.direccion,
      comuna: c.comuna,
      ciudad: c.ciudad,
    });
  }

  cancelEdit(): void {
    this.editId.set(null);
    this.form.reset({
      rut: '',
      razonSocial: '',
      email: '',
      telefono: '',
      direccion: '',
      comuna: '',
      ciudad: '',
    });
  }

  invalidCtrl(name: string): boolean {
    const c = this.form.get(name);
    if (!c) return false;
    return c.invalid && (c.touched || c.dirty);
  }

  errorText(ctrl: AbstractControl | null): string | null {
    if (!ctrl?.errors || (!ctrl.touched && !ctrl.dirty)) return null;
    if (ctrl.errors['required']) return 'Campo obligatorio';
    if (ctrl.errors['email']) return 'Email inválido';
    if (ctrl.errors['maxlength']) return 'Texto demasiado largo';
    return 'Valor inválido';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Complete los campos obligatorios correctamente');
      return;
    }

    const payload = this.form.getRawValue() as CreateClientePayload;
    if (!payload.telefono?.trim()) {
      delete (payload as { telefono?: string }).telefono;
    }

    this.saving.set(true);
    const id = this.editId();
    const req = id
      ? this.ventas.updateCliente(id, payload)
      : this.ventas.createCliente(payload);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(id ? 'Cliente actualizado' : 'Cliente registrado');
        this.cancelEdit();
        this.showForm.set(false);
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        const raw = err?.error?.message;
        let msg = 'Error al guardar cliente';
        if (typeof raw === 'string') {
          msg = raw;
        } else if (Array.isArray(raw) && raw.length) {
          msg = String(raw[0]);
        }
        this.toast.error(msg);
      },
    });
  }

  remove(c: Cliente): void {
    if (!confirm(`¿Eliminar cliente ${c.razonSocial}?`)) return;
    this.ventas.deleteCliente(c.id).subscribe({
      next: () => {
        this.toast.success('Cliente eliminado');
        this.load();
      },
      error: (err) => {
        const raw = err?.error?.message;
        this.toast.error(
          typeof raw === 'string' ? raw : 'No se pudo eliminar el cliente',
        );
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.ventas.listClientes().subscribe({
      next: (items) => {
        this.lista.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        const raw = err?.error?.message;
        const msg =
          typeof raw === 'string'
            ? raw
            : 'No se pudieron cargar los clientes. ¿Ejecutó la migración ventas-crm.sql?';
        this.toast.error(msg);
      },
    });
  }
}
