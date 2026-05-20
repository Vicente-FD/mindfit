import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="page-card">
      <h1 class="text-xl font-semibold text-pure-white">Panel Super Admin</h1>
      <p class="mt-2 text-sm text-slate-grey">
        Use el menú lateral para gestionar personal, activos con códigos QR y permisos del sistema.
      </p>
      <ul class="mt-4 space-y-2 text-sm text-pure-white">
        <li>· Personal y permisos</li>
        <li>· Activos con códigos LF-MX-25-01-01</li>
        <li>· Etiquetas QR imprimibles</li>
      </ul>
    </div>
  `,
})
export class AdminDashboardComponent {}
