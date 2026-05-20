import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthUser,
  EstadoSesion,
  LoginResponse,
  ROLE_DASHBOARD_ROUTES,
  UserRole,
} from '../models/user.model';

const TOKEN_KEY = 'mindfit_token';
const USER_KEY = 'mindfit_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenSignal = signal<string | null>(this.readToken());
  private readonly userSignal = signal<AuthUser | null>(this.readUser());

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
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
          localStorage.setItem(TOKEN_KEY, response.accessToken);
          localStorage.setItem(USER_KEY, JSON.stringify(response.user));
          this.tokenSignal.set(response.accessToken);
          this.userSignal.set(response.user);
        }),
      );
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http
        .post(`${environment.apiUrl}/auth/logout`, {})
        .pipe(
          finalize(() => this.clearSessionAndRedirect()),
        )
        .subscribe({ error: () => this.clearSessionAndRedirect() });
    } else {
      this.clearSessionAndRedirect();
    }
  }

  patchUser(partial: Partial<AuthUser>): void {
    const current = this.userSignal();
    if (!current) return;
    const updated = { ...current, ...partial };
    this.userSignal.set(updated);
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
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
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
