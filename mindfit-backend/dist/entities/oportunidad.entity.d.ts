import { EtapaOportunidad } from '../common/enums';
import { Cliente } from './cliente.entity';
import { Usuario } from './usuario.entity';
import { CotizacionVenta } from './cotizacion-venta.entity';
export interface OportunidadChecklistItem {
    id: string;
    texto: string;
    completado: boolean;
}
export interface OportunidadActividad {
    id: string;
    texto: string;
    createdAt: string;
}
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
    fechaCierreEstimada: string | null;
    checklist: OportunidadChecklistItem[];
    actividades: OportunidadActividad[];
    createdAt: Date;
    updatedAt: Date;
    cotizaciones: CotizacionVenta[];
}
