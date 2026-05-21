import { Activo } from './activo.entity';
export declare class PlanPreventivo {
    id: number;
    titulo: string;
    descripcion: string | null;
    activoId: number;
    equipo: Activo;
    intervaloDias: number;
    proximaFechaEjecucion: string;
    planActivo: boolean;
    createdAt: Date;
    updatedAt: Date;
}
