import { Usuario } from './usuario.entity';
export declare class LicenciaTecnico {
    id: number;
    tecnicoId: number;
    tecnico: Usuario;
    tipoLicencia: string;
    fechaVencimiento: string;
    documentoUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
