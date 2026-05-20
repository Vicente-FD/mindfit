export type WorkOrderPriority = 'baja' | 'media' | 'alta';
export type WorkOrderStatus =
  | 'pendiente'
  | 'asignada'
  | 'en_proceso'
  | 'finalizada'
  | 'aprobada';
export type MaintenanceType = 'correctivo' | 'preventivo';
export type ClasificacionOt = 'maquina' | 'infraestructura';

export interface WorkOrderUsuario {
  id: number;
  nombre: string;
  email?: string;
  rol?: string;
}

export interface WorkOrderComentario {
  id: number;
  comentario: string;
  createdAt: string;
  autor?: WorkOrderUsuario | null;
}

export type TipoEvidenciaOt = 'antes' | 'despues';

export interface WorkOrderEvidencia {
  id: number;
  tipoEvidencia: TipoEvidenciaOt;
  urlImagen: string;
  createdAt?: string;
}

export interface WorkOrderSucursal {
  id: number;
  nombre: string;
  direccion?: string | null;
  comuna?: string | null;
  ciudad?: string | null;
}

export interface WorkOrderActivo {
  id: number;
  uuidActivo: string;
  codigoQrToken: string;
  codigoInventario?: string;
  nombre: string;
  marca: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  categoria: string;
  sucursalId: number;
  estadoOperacional: string;
  sucursal?: WorkOrderSucursal;
}

export interface WorkOrder {
  id: number;
  codigoOt: string;
  clasificacion?: ClasificacionOt;
  activoId: number | null;
  sucursalId: number;
  creadoPorId: number;
  asignadoAId: number | null;
  titulo: string;
  descripcion: string | null;
  prioridad: WorkOrderPriority;
  tipoMantenimiento: MaintenanceType;
  estado: WorkOrderStatus;
  tiempoEstimadoMinutos: number | null;
  fechaProgramacion: string | null;
  fechaInicioReal: string | null;
  fechaFinReal: string | null;
  motivoRechazo: string | null;
  fechaAprobacion: string | null;
  createdAt: string;
  updatedAt: string;
  activo?: WorkOrderActivo | null;
  sucursal?: WorkOrderSucursal;
  asignadoA?: WorkOrderUsuario | null;
  tecnicoAsignado?: WorkOrderUsuario | null;
  comentarios?: WorkOrderComentario[];
  evidencias?: WorkOrderEvidencia[];
}

export const REVERTIR_APROBACION_MS = 2 * 60 * 1000;

export type OrdenesTab = 'activas' | 'por_aprobar' | 'historico';

export interface ListWorkOrdersParams {
  estado?: 'activas' | 'por_aprobar' | 'finalizadas';
  fechaInicio?: string;
  fechaFin?: string;
  sucursalId?: number;
  tecnicoId?: number;
}

export interface UpdateWorkOrderStatusPayload {
  estado: 'en_proceso';
}

export interface CloseWorkOrderPayload {
  comentario: string;
  fotoDespues: File;
}
