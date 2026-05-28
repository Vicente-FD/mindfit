import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, timeout, catchError, throwError } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import type {
  PasswordResetCompletedEvent,
  PasswordResetRejectedEvent,
} from './password-reset.types';

const DEFAULT_WAIT_MS = 5 * 60 * 1000;

@Injectable()
export class PasswordResetWsService implements OnDestroy {
  private socket: Socket | null = null;
  private watchToken: string | null = null;

  ngOnDestroy(): void {
    this.disconnect();
  }

  connect(watchToken: string): void {
    this.disconnect();
    this.watchToken = watchToken;
    this.socket = io(`${environment.wsUrl}/password-reset`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      this.socket?.emit('subscribe', { watchToken });
    });
  }

  waitForCompletion(waitMs = DEFAULT_WAIT_MS): Observable<PasswordResetCompletedEvent> {
    const subject = new Subject<PasswordResetCompletedEvent>();

    if (!this.socket) {
      subject.error(new Error('Sin conexión en tiempo real'));
      return subject.asObservable();
    }

    const onCompleted = (payload: PasswordResetCompletedEvent) => {
      cleanup();
      subject.next(payload);
      subject.complete();
    };

    const onRejected = (payload: PasswordResetRejectedEvent) => {
      cleanup();
      subject.error(
        new Error(
          payload.message ??
            'El administrador rechazó su solicitud de restablecimiento de contraseña.',
        ),
      );
    };

    const onConnectError = () => {
      cleanup();
      subject.error(new Error('No se pudo conectar al servidor en tiempo real'));
    };

    const cleanup = () => {
      this.socket?.off('passwordResetCompleted', onCompleted);
      this.socket?.off('passwordResetRejected', onRejected);
      this.socket?.off('connect_error', onConnectError);
    };

    this.socket.on('passwordResetCompleted', onCompleted);
    this.socket.on('passwordResetRejected', onRejected);
    this.socket.on('connect_error', onConnectError);

    return subject.asObservable().pipe(
      timeout(waitMs),
      catchError((err) => {
        cleanup();
        if (err?.name === 'TimeoutError') {
          return throwError(
            () =>
              new Error(
                'El administrador aún no ha generado su clave. Puede cerrar esta ventana; su solicitud sigue en proceso.',
              ),
          );
        }
        return throwError(() => err);
      }),
    );
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.watchToken = null;
  }
}
