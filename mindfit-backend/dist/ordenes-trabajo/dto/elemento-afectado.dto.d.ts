import { type TipoElementoServicio } from '../../common/types/capacidades-servicios.types';
export declare class ElementoAfectadoDto {
    tipo_elemento: TipoElementoServicio;
    cantidad: number;
}
export declare class ServicioAfectadoDetalleDto {
    tipoFacilidad: string;
    elementos: ElementoAfectadoDto[];
}
