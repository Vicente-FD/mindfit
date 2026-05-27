export type PasswordResetViewState = 'FORM' | 'CONFIRM' | 'WAITING' | 'RESULT';

export interface PasswordResetCompletedEvent {
  contrasenaTemporal: string;
  solicitudId: number;
}

export interface SolicitarRecuperacionResponse {
  message: string;
  watchToken?: string;
}
