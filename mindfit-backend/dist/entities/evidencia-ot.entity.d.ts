import { TipoEvidencia } from '../common/enums';
import { OrdenTrabajo } from './orden-trabajo.entity';
import { Usuario } from './usuario.entity';
export declare class EvidenciaOt {
    id: number;
    ordenTrabajoId: number;
    ordenTrabajo: OrdenTrabajo;
    tipoEvidencia: TipoEvidencia;
    urlImagen: string;
    cargadoPorId: number;
    cargadoPor: Usuario;
    createdAt: Date;
}
