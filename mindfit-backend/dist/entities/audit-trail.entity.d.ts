import { OperacionAuditoria } from '../common/enums';
import { Usuario } from './usuario.entity';
export declare class AuditTrail {
    id: string;
    timeStamp: Date;
    tableName: string;
    rowPk: string;
    operation: OperacionAuditoria;
    userId: number | null;
    usuario: Usuario | null;
    oldData: Record<string, unknown> | null;
    newData: Record<string, unknown> | null;
}
