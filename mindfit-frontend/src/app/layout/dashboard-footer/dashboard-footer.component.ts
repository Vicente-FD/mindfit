import { Component } from '@angular/core';
import { APP_BUILD_INFO } from '../../core/constants/app-build-info';

@Component({
  selector: 'app-dashboard-footer',
  template: `
    <footer class="dashboard-app-footer">
      <p>
        Última actualización: {{ lastUpdate }} - {{ developer }}
      </p>
    </footer>
  `,
})
export class DashboardFooterComponent {
  readonly lastUpdate = APP_BUILD_INFO.lastUpdate;
  readonly developer = APP_BUILD_INFO.developer;
}
