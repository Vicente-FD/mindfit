import { RolUsuario } from '../common/enums';
import type { PermisosUi } from '../common/interfaces/permisos-ui.interface';
import { Sucursal } from './sucursal.entity';
import { OrdenTrabajo } from './orden-trabajo.entity';
import { EvidenciaOt } from './evidencia-ot.entity';
import { ComentarioOt } from './comentario-ot.entity';
import { AuditTrail } from './audit-trail.entity';
export declare class Usuario {
    id: number;
    email: string;
    passwordHash: string;
    nombre: string;
    rol: RolUsuario;
    sucursalId: number | null;
    sucursal: Sucursal | null;
    telefono: string | null;
    estaActivo: boolean;
    permisosUi: PermisosUi;
    createdAt: Date;
    updatedAt: Date;
    ordenesCreadas: OrdenTrabajo[];
    ordenesAsignadas: OrdenTrabajo[];
    evidenciasCargadas: EvidenciaOt[];
    comentarios: ComentarioOt[];
    auditorias: AuditTrail[];
}
