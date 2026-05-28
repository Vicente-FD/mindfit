import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

export interface PasswordResetCompletedPayload {
  contrasenaTemporal: string;
  solicitudId: number;
}

export interface PasswordResetRejectedPayload {
  solicitudId: number;
  message: string;
}

@Injectable()
export class PasswordResetEventsService {
  private static readonly ADMIN_ROOM = 'admin:recuperacion';

  private server: Server | null = null;

  registerServer(server: Server): void {
    this.server = server;
  }

  emitPasswordResetCompleted(
    watchToken: string,
    payload: PasswordResetCompletedPayload,
  ): void {
    if (!this.server || !watchToken) return;
    this.server
      .to(`reset:${watchToken}`)
      .emit('passwordResetCompleted', payload);
  }

  emitPasswordResetRejected(
    watchToken: string,
    payload: PasswordResetRejectedPayload,
  ): void {
    if (!this.server || !watchToken) return;
    this.server.to(`reset:${watchToken}`).emit('passwordResetRejected', payload);
  }

  emitAdminPendientesChanged(): void {
    if (!this.server) return;
    this.server
      .to(PasswordResetEventsService.ADMIN_ROOM)
      .emit('passwordResetPendientesChanged', { at: new Date().toISOString() });
  }
}
