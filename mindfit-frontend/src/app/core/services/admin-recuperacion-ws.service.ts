import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminRecuperacionWsService implements OnDestroy {
  private socket: Socket | null = null;
  private readonly pendientesChanged$ = new Subject<void>();

  ngOnDestroy(): void {
    this.disconnect();
  }

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(`${environment.wsUrl}/password-reset`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      this.socket?.emit('subscribeAdmin', {});
    });

    this.socket.on('passwordResetPendientesChanged', () => {
      this.pendientesChanged$.next();
    });
  }

  onPendientesChanged(): Observable<void> {
    return this.pendientesChanged$.asObservable();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
