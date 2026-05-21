import { Injectable, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { EstadoSesion, SessionProfileResponse } from '../models/user.model';

const PING_INTERVAL_MS = 45_000;
const PROFILE_INTERVAL_MS = 30_000;
const IDLE_MS = 5 * 60_000;

@Injectable({ providedIn: 'root' })
export class SessionHeartbeatService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private profileIntervalId: ReturnType<typeof setInterval> | null = null;
  private lastActivity = Date.now();
  private lastSent: EstadoSesion | null = null;
  private readonly onActivity = () => {
    this.lastActivity = Date.now();
  };
  private readonly onVisibility = () => {
    if (!this.auth.isAuthenticated()) return;
    if (document.hidden) {
      void this.send('reposo');
    } else {
      this.lastActivity = Date.now();
      void this.send('conectado');
    }
  };

  start(): void {
    this.stop();
    if (!this.auth.isAuthenticated()) return;

    void this.refreshProfile();
    void this.send('conectado');

    this.intervalId = setInterval(() => this.tick(), PING_INTERVAL_MS);
    this.profileIntervalId = setInterval(
      () => void this.refreshProfile(),
      PROFILE_INTERVAL_MS,
    );

    document.addEventListener('visibilitychange', this.onVisibility);
    for (const ev of ['mousedown', 'keydown', 'touchstart', 'scroll'] as const) {
      document.addEventListener(ev, this.onActivity, { passive: true });
    }
  }

  stop(): void {
    if (this.intervalId != null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.profileIntervalId != null) {
      clearInterval(this.profileIntervalId);
      this.profileIntervalId = null;
    }
    document.removeEventListener('visibilitychange', this.onVisibility);
    for (const ev of ['mousedown', 'keydown', 'touchstart', 'scroll'] as const) {
      document.removeEventListener(ev, this.onActivity);
    }
    this.lastSent = null;
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private tick(): void {
    if (!this.auth.isAuthenticated()) {
      this.stop();
      return;
    }
    const idle = Date.now() - this.lastActivity > IDLE_MS;
    const estado: EstadoSesion = document.hidden || idle ? 'reposo' : 'conectado';
    void this.send(estado);
  }

  private async refreshProfile(): Promise<void> {
    if (!this.auth.isAuthenticated()) return;
    this.auth.refreshSessionProfile().subscribe({
      next: (profile) => this.handleProfile(profile),
      error: (err) => {
        if (err?.status === 401) {
          this.auth.forceLogout();
        }
      },
    });
  }

  private handleProfile(res: SessionProfileResponse): void {
    if (res.forceLogout) {
      this.auth.forceLogout();
      return;
    }
    this.auth.applySessionProfile(res);
  }

  private send(estado: EstadoSesion): void {
    if (this.lastSent === estado) return;
    this.http
      .patch<SessionProfileResponse>(`${environment.apiUrl}/auth/sesion`, {
        estado,
      })
      .subscribe({
        next: (res) => {
          this.lastSent = res.user?.estadoSesion ?? estado;
          this.handleProfile(res);
        },
        error: (err) => {
          if (err?.status === 401) {
            this.auth.forceLogout();
          }
        },
      });
  }
}
