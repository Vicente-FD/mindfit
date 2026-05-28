import { EstadoFacilidadCritica } from '../common/enums';
import { FacilidadCritica } from './facilidad-critica.entity';
import { Usuario } from './usuario.entity';
export declare class FacilidadCriticaHistorial {
    id: number;
    facilidadCriticaId: number;
    facilidadCritica: FacilidadCritica;
    estadoAnterior: EstadoFacilidadCritica;
    estadoNuevo: EstadoFacilidadCritica;
    descripcionProblema: string | null;
    reportadoPorId: number | null;
    reportadoPor: Usuario | null;
    createdAt: Date;
}
