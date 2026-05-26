import { EstadoCotizacionVenta } from '../common/enums';
import { Cliente } from './cliente.entity';
import { Usuario } from './usuario.entity';
import { Oportunidad } from './oportunidad.entity';
import { CotizacionVentasDetalle } from './cotizacion-ventas-detalle.entity';
export declare class CotizacionVenta {
    id: number;
    folio: string;
    clienteId: number;
    cliente: Cliente;
    creadoPorId: number;
    creadoPor: Usuario;
    oportunidadId: number | null;
    oportunidad: Oportunidad | null;
    divisaCodigo: string;
    tasaCambioClp: string;
    subtotalNeto: string;
    montoIva: string;
    montoBruto: string;
    comentariosComerciales: string | null;
    estado: EstadoCotizacionVenta;
    createdAt: Date;
    updatedAt: Date;
    detalles: CotizacionVentasDetalle[];
}
