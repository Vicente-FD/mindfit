import { WorkOrderPriority } from './work-order.model';

export type AssetCategory =
  | 'cardio'
  | 'fuerza'
  | 'climatizacion'
  | 'infraestructura'
  | 'bomba_agua';

export interface AnalyticsFilters {
  sucursalId?: number;
  tecnicoId?: number;
  categoria?: AssetCategory;
}

export interface KpisResponse {
  efectividadPe: number;
  otsReportadas: number;
  otsResueltas: number;
  gastoAcumuladoMantenimiento: number;
  mttrHoras: number;
  fallasPorCategoria: { categoria: string; total: number }[];
  otsPorSucursal: { sucursal: string; total: number }[];
}

export interface TecnicoOption {
  id: number;
  nombre: string;
  email: string;
  sucursalId: number | null;
}

export const CATEGORIAS_ACTIVO: { value: AssetCategory; label: string }[] = [
  { value: 'cardio', label: 'Cardio' },
  { value: 'fuerza', label: 'Fuerza' },
  { value: 'climatizacion', label: 'Climatización' },
  { value: 'infraestructura', label: 'Infraestructura' },
  { value: 'bomba_agua', label: 'Bomba de agua' },
];

export const PRIORIDADES_OT: { value: WorkOrderPriority; label: string }[] = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
];
