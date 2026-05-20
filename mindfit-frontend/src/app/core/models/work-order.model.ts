export type WorkOrderPriority = 'baja' | 'media' | 'alta';
export type WorkOrderStatus =
  | 'pendiente'
  | 'asignada'
  | 'en_proceso'
  | 'finalizada'
  | 'aprobada';
export type MaintenanceType = 'correctivo' | 'preventivo';

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
  createdAt: string;
  updatedAt: string;
  activo?: WorkOrderActivo | null;
  sucursal?: WorkOrderSucursal;
}

export interface UpdateWorkOrderStatusPayload {
  estado: 'en_proceso';
}

export interface CloseWorkOrderPayload {
  comentario: string;
  fotosAntes: File;
  fotosDespues: File;
}
