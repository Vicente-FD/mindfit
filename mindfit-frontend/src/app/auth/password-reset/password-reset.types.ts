export type PasswordResetViewState = 'FORM' | 'CONFIRM' | 'WAITING' | 'RESULT';

export interface PasswordResetCompletedEvent {
  contrasenaTemporal: string;
  solicitudId: number;
}

export interface PasswordResetRejectedEvent {
  solicitudId: number;
  message: string;
}

export interface SolicitarRecuperacionResponse {
  message: string;
  watchToken?: string;
}
