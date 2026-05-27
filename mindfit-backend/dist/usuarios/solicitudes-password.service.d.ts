import { DataSource } from 'typeorm';
import { PasswordResetEventsService } from '../auth/password-reset/password-reset-events.service';
export interface SolicitudPasswordPendienteDto {
    id: number;
    usuarioId: number;
    nombre: string;
    email: string;
    rol: string;
    createdAt: Date;
}
export interface AprobarSolicitudPasswordResultDto {
    solicitudId: number;
    usuarioId: number;
    contrasenaTemporal: string;
}
export interface SolicitarRecuperacionResponseDto {
    message: string;
    watchToken?: string;
}
export declare class SolicitudesPasswordService {
    private readonly dataSource;
    private readonly passwordResetEvents;
    constructor(dataSource: DataSource, passwordResetEvents: PasswordResetEventsService);
    solicitar(email: string): Promise<SolicitarRecuperacionResponseDto>;
    findPendientes(): Promise<SolicitudPasswordPendienteDto[]>;
    aprobar(solicitudId: number, adminUserId: number): Promise<AprobarSolicitudPasswordResultDto>;
    private generateReadablePassword;
}
