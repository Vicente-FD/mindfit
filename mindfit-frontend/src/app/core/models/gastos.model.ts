export type EstadoRendicionGasto = 'pendiente' | 'aprobado' | 'rechazado';

export const LIMITE_MENSUAL_GASTO = 100_000;

export interface RendicionGasto {
  id: number;
  tecnicoId: number;
  tecnicoNombre: string;
  monto: number;
  descripcion: string;
  urlBoleta: string;
  estado: EstadoRendicionGasto;
  motivoRechazo: string | null;
  fechaGasto: string;
  createdAt: string;
  updatedAt: string;
}

export interface MiSaldoGastos {
  limiteMensual: number;
  montoAprobadoMes: number;
  saldoDisponible: number;
  historial: RendicionGasto[];
}

export interface SaldoTecnicoResumen {
  tecnicoId: number;
  tecnicoNombre: string;
  tecnicoEmail: string;
  limiteMensual: number;
  montoAprobadoMes: number;
  saldoDisponible: number;
  porcentajeConsumido: number;
  alertaSaldoBajo: boolean;
}

export interface AdminGastosView {
  pendientes: RendicionGasto[];
  tecnicos: SaldoTecnicoResumen[];
}

export interface GastosListaResumen {
  totalAprobado: number;
  totalPendiente: number;
  totalRechazado: number;
  totalGeneral: number;
  cantidad: number;
}

export interface ListaGastosResponse {
  mes: string;
  desde: string;
  hasta: string;
  items: RendicionGasto[];
  resumen: GastosListaResumen;
}

export interface ListaGastosParams {
  mes?: string;
  tecnicoId?: number;
  estado?: EstadoRendicionGasto | '';
}

export interface DecidirGastoPayload {
  estado: 'aprobado' | 'rechazado';
  motivoRechazo?: string;
}
