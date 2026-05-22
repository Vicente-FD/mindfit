import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthUser,
  LoginResponse,
  ROLE_DASHBOARD_ROUTES,
  SessionProfileResponse,
  UserRole,
} from '../models/user.model';
import { PermisosUi, hasPermiso, resolvePermisosUi } from '../models/permisos-ui.model';

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

  private persistSession(token: string, user: AuthUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.tokenSignal.set(token);
    this.userSignal.set(user);
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

  hasRole(...roles: UserRole[]): boolean {
    const current = this.userSignal()?.rol;
    return !!current && roles.includes(current);
  }

  getDashboardRouteForRole(rol?: UserRole | null): string {
    const role = rol ?? this.userSignal()?.rol;
    if (!role) return '/login';
    return ROLE_DASHBOARD_ROUTES[role] ?? '/login';
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
      return parsed;
    } catch {
      return null;
    }
  }
}
