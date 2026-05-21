import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AuditTrailService } from '../../../core/services/audit-trail.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuditTrailItem } from '../../../core/models/audit-trail.model';

@Component({
  selector: 'app-bitacora-admin',
  imports: [FormsModule, LucideAngularModule, DatePipe],
  templateUrl: './bitacora-admin.component.html',
  styleUrl: './bitacora-admin.component.css',
})
export class BitacoraAdminComponent implements OnInit {
  private readonly auditService = inject(AuditTrailService);
  private readonly toast = inject(ToastService);

  readonly items = signal<AuditTrailItem[]>([]);
  readonly loading = signal(false);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly total = signal(0);
  readonly filtroTabla = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.auditService
      .list({
        page: this.page(),
        limit: 40,
        tableName: this.filtroTabla() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.items.set(res.data);
          this.totalPages.set(res.meta.totalPages);
          this.total.set(res.meta.total);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.toast.error('No se pudo cargar la bitácora del sistema');
        },
      });
  }

  onFiltroChange(value: string): void {
    this.filtroTabla.set(value);
    this.page.set(1);
    this.load();
  }

  prevPage(): void {
    if (this.page() <= 1) return;
    this.page.update((p) => p - 1);
    this.load();
  }

  nextPage(): void {
    if (this.page() >= this.totalPages()) return;
    this.page.update((p) => p + 1);
    this.load();
  }

  operacionClass(op: string): string {
    if (op === 'INSERT') return 'audit-op audit-op--insert';
    if (op === 'DELETE') return 'audit-op audit-op--delete';
    return 'audit-op audit-op--update';
  }

  operacionLabel(op: string): string {
    if (op === 'INSERT') return 'Alta';
    if (op === 'DELETE') return 'Baja';
    return 'Cambio';
  }
}
