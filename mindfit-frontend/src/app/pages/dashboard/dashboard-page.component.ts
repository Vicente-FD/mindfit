import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dashboard-page',
  template: `
    <section class="page-card">
      <h2 class="page-title">{{ title }}</h2>
      <p class="page-desc">{{ description }}</p>
      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        <div class="stat-card">
          <p class="stat-label">Estado del módulo</p>
          <p class="stat-value text-status-green">Activo</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Vista</p>
          <p class="stat-value text-orange-energy">{{ title }}</p>
        </div>
      </div>
    </section>
  `,
})
export class DashboardPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly title = this.route.snapshot.data['title'] as string;
  readonly description = this.route.snapshot.data['description'] as string;
}
