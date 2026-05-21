import { Repuesto } from './repuesto.entity';
export declare class BodegaStock {
    id: number;
    repuestoId: number;
    repuesto: Repuesto;
    cantidadActual: number;
    cantidadMinimaAlerta: number;
    updatedAt: Date;
    createdAt: Date;
}
