import { Server } from 'socket.io';
export interface PasswordResetCompletedPayload {
    contrasenaTemporal: string;
    solicitudId: number;
}
export declare class PasswordResetEventsService {
    private server;
    registerServer(server: Server): void;
    emitPasswordResetCompleted(watchToken: string, payload: PasswordResetCompletedPayload): void;
}
