import { Server } from 'socket.io';
export interface PasswordResetCompletedPayload {
    contrasenaTemporal: string;
    solicitudId: number;
}
export interface PasswordResetRejectedPayload {
    solicitudId: number;
    message: string;
}
export declare class PasswordResetEventsService {
    private static readonly ADMIN_ROOM;
    private server;
    registerServer(server: Server): void;
    emitPasswordResetCompleted(watchToken: string, payload: PasswordResetCompletedPayload): void;
    emitPasswordResetRejected(watchToken: string, payload: PasswordResetRejectedPayload): void;
    emitAdminPendientesChanged(): void;
}
