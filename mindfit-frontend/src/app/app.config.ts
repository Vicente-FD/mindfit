import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  isDevMode,
} from '@angular/core';
import {
  LucideAngularModule,
  LayoutDashboard,
  Package,
  Users,
  AlertTriangle,
  BarChart3,
  Wrench,
  ClipboardList,
  LogOut,
} from 'lucide-angular';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    importProvidersFrom(
      LucideAngularModule.pick({
        LayoutDashboard,
        Package,
        Users,
        AlertTriangle,
        BarChart3,
        Wrench,
        ClipboardList,
        LogOut,
      }),
    ),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
