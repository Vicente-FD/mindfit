import { Repository } from 'typeorm';
import { OperacionAuditoria } from '../common/enums';
import { AuditTrail } from '../entities/audit-trail.entity';
import { FilterAuditTrailDto } from './dto/filter-audit-trail.dto';
export interface AuditTrailItemDto {
    id: string;
    timeStamp: string;
    tableName: string;
    rowPk: string;
    operation: OperacionAuditoria;
    userId: number | null;
    usuarioNombre: string | null;
    mensaje: string;
}
export declare class AuditTrailService {
    private readonly repo;
    constructor(repo: Repository<AuditTrail>);
    findAll(filters: FilterAuditTrailDto): Promise<{
        data: AuditTrailItemDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    private toDto;
    private formatMensaje;
    private formatOrdenTrabajo;
    private formatActivo;
}
