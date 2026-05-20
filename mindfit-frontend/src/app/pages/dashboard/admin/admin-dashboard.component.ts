import { Component, signal } from '@angular/core';
import { UsuariosAdminComponent } from './usuarios-admin.component';
import { ActivosRegistroComponent } from './activos-registro.component';

type AdminTab = 'usuarios' | 'activos' | 'resumen';

@Component({
  selector: 'app-admin-dashboard',
  imports: [UsuariosAdminComponent, ActivosRegistroComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent {
  readonly tab = signal<AdminTab>('usuarios');

  setTab(t: AdminTab): void {
    this.tab.set(t);
  }
}
