import { ClasificacionOt, WorkOrder, WorkOrderPriority } from './work-order.model';

export interface BulkWorkOrderTask {
  clasificacion?: ClasificacionOt;
  activoId?: number;
  sucursalId: number;
  titulo: string;
  descripcion?: string;
  prioridad?: WorkOrderPriority;
  tipoMantenimiento: 'correctivo' | 'preventivo';
  fechaProgramacion: string;
  asignadoAId: number;
}

export interface BulkCreateWorkOrdersResponse {
  created: WorkOrder[];
  total: number;
}
