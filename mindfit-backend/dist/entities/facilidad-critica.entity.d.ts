import { EstadoFacilidadCritica, TipoFacilidadCritica } from '../common/enums';
import { Sucursal } from './sucursal.entity';
import { Usuario } from './usuario.entity';
import { FacilidadCriticaHistorial } from './facilidad-critica-historial.entity';
export declare class FacilidadCritica {
    id: number;
    sucursalId: number;
    sucursal: Sucursal;
    tipo: TipoFacilidadCritica;
    estado: EstadoFacilidadCritica;
    notasTecnicas: string | null;
    actualizadoPorId: number | null;
    actualizadoPor: Usuario | null;
    createdAt: Date;
    updatedAt: Date;
    historial: FacilidadCriticaHistorial[];
}
