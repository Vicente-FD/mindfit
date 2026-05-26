import { EtapaOportunidad } from '../common/enums';
import { Cliente } from './cliente.entity';
import { Usuario } from './usuario.entity';
import { CotizacionVenta } from './cotizacion-venta.entity';
export declare class Oportunidad {
    id: number;
    clienteId: number;
    cliente: Cliente;
    creadoPorId: number;
    creadoPor: Usuario;
    titulo: string;
    etapa: EtapaOportunidad;
    montoEstimado: string;
    divisaCodigo: string;
    notas: string | null;
    createdAt: Date;
    updatedAt: Date;
    cotizaciones: CotizacionVenta[];
}
