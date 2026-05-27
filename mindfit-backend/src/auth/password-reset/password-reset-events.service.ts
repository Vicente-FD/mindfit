import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

export interface PasswordResetCompletedPayload {
  contrasenaTemporal: string;
  solicitudId: number;
}

@Injectable()
export class PasswordResetEventsService {
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
}
