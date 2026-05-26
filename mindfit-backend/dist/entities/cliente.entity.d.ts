import { Oportunidad } from './oportunidad.entity';
import { CotizacionVenta } from './cotizacion-venta.entity';
export declare class Cliente {
    id: number;
    rut: string;
    razonSocial: string;
    email: string;
    telefono: string | null;
    direccion: string;
    comuna: string;
    ciudad: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    oportunidades: Oportunidad[];
    cotizaciones: CotizacionVenta[];
}
