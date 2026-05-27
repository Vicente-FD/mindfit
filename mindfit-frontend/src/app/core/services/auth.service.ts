import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthUser,
  CambiarPasswordPerfilResponse,
  LoginResponse,
  SessionProfileResponse,
} from '../models/user.model';
import {
  PermisosUi,
  hasAnyPermiso,
  hasPermiso,
  resolvePermisosUi,
} from '../models/permisos-ui.model';
import { resolveLandingRoute } from '../navigation/dashboard-nav.config';

const TOKEN_KEY = 'mindfit_token';
const USER_KEY = 'mindfit_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenSignal = signal<string | null>(this.readToken());
  private readonly userSignal = signal<AuthUser | null>(this.readUser());

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly permisosUi = computed(() => {
    const u = this.userSignal();
    if (!u) return null;
    return resolvePermisosUi(u.rol, u.permisosUi);
  });
  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly role = computed(() => this.userSignal()?.rol ?? null);
  readonly mustChangePassword = computed(
    () => !!this.userSignal()?.requiereCambioPassword,
  );

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((response) => {
          this.persistSession(response.accessToken, response.user);
        }),
      );
  }

  solicitarRecuperacion(email: string) {
    return this.http.post<{ message: string; watchToken?: string }>(
      `${environment.apiUrl}/auth/recuperar/solicitar`,
      { email },
    );
  }

  cambiarPasswordPerfil(passwordActual: string, nuevoPassword: string) {
    return this.http
      .patch<CambiarPasswordPerfilResponse>(
        `${environment.apiUrl}/auth/mi-perfil/cambiar-password`,
        { passwordActual, nuevoPassword },
      )
      .pipe(
        tap((response) => {
          this.persistSession(response.accessToken, response.user);
        }),
      );
  }

  refreshSessionProfile() {
    return this.http.get<SessionProfileResponse>(`${environment.apiUrl}/auth/me`);
  }

  applySessionProfile(profile: SessionProfileResponse): void {
    if (profile.forceLogout) {
      this.forceLogout();
      return;
    }
    this.patchUser(profile.user);
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http
        .post(`${environment.apiUrl}/auth/logout`, {})
        .pipe(finalize(() => this.clearSessionAndRedirect()))
        .subscribe({ error: () => this.clearSessionAndRedirect() });
    } else {
      this.clearSessionAndRedirect();
    }
  }

  forceLogout(): void {
    this.clearSessionAndRedirect();
  }

  patchUser(partial: Partial<AuthUser>): void {
    const current = this.userSignal();
    if (!current) return;
    const rol = partial.rol ?? current.rol;
    const permisosUi =
      partial.permisosUi !== undefined
        ? resolvePermisosUi(rol, partial.permisosUi)
        : current.permisosUi;
    const updated: AuthUser = {
      ...current,
      ...partial,
      permisosUi,
    };
    this.userSignal.set(updated);
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
  }

  canAccess(permiso: keyof PermisosUi): boolean {
    const u = this.userSignal();
    if (!u) return false;
    return hasPermiso(u.rol, u.permisosUi, permiso);
  }

  canAccessAny(...permisos: (keyof PermisosUi)[]): boolean {
    const u = this.userSignal();
    if (!u) return false;
    return hasAnyPermiso(u.rol, u.permisosUi, permisos);
  }

  /** Primera ruta permitida del sidebar (o vista móvil por rol). */
  getLandingRoute(user?: AuthUser | null): string {
    const u = user ?? this.userSignal();
    if (!u) return '/login';
    if (u.requiereCambioPassword) return '/dashboard/perfil';
    return resolveLandingRoute(u);
  }

  /** @deprecated Usar getLandingRoute() */
  getDashboardRouteForRole(_rol?: AuthUser['rol'] | null): string {
    return this.getLandingRoute();
  }

  private persistSession(token: string, user: AuthUser): void {
    const resolved: AuthUser = {
      ...user,
      permisosUi: resolvePermisosUi(user.rol, user.permisosUi),
      requiereCambioPassword: user.requiereCambioPassword ?? false,
    };
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(resolved));
    this.tokenSignal.set(token);
    this.userSignal.set(resolved);
  }

  private clearSessionAndRedirect(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  getUser(): AuthUser | null {
    return this.userSignal();
  }

  hasRole(...roles: AuthUser['rol'][]): boolean {
    const current = this.userSignal()?.rol;
    return !!current && roles.includes(current);
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      return Date.now() < exp;
    } catch {
      return false;
    }
  }

  private readToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private readUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as AuthUser;
      if (!parsed.permisosUi) {
        parsed.permisosUi = resolvePermisosUi(parsed.rol, {});
      }
      parsed.requiereCambioPassword = parsed.requiereCambioPassword ?? false;
      return parsed;
    } catch {
      return null;
    }
  }
}
