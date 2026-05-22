import { EstadoRendicionGasto } from '../../common/enums/estado-rendicion-gasto.enum';
export declare class DecidirRendicionGastoDto {
    estado: EstadoRendicionGasto.APROBADO | EstadoRendicionGasto.RECHAZADO;
    motivoRechazo?: string;
    motivoRechazoAprobacion?: string;
}
