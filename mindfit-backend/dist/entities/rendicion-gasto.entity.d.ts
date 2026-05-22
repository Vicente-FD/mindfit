import { EstadoRendicionGasto } from '../common/enums/estado-rendicion-gasto.enum';
import { Usuario } from './usuario.entity';
export declare class RendicionGasto {
    id: number;
    tecnicoId: number;
    tecnico: Usuario;
    monto: number;
    descripcion: string;
    urlBoleta: string;
    estado: EstadoRendicionGasto;
    motivoRechazo: string | null;
    fechaGasto: string;
    createdAt: Date;
    updatedAt: Date;
}
