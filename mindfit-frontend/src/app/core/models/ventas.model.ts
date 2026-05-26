export type EtapaOportunidad =
  | 'prospeccion'
  | 'calificacion'
  | 'propuesta'
  | 'ganada'
  | 'perdida';

export type DivisaCodigo = 'CLP' | 'USD' | 'EUR' | 'CAD';

export interface Cliente {
  id: number;
  rut: string;
  razonSocial: string;
  email: string;
  telefono: string | null;
  direccion: string;
  comuna: string;
  ciudad: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientePayload {
  rut: string;
  razonSocial: string;
  email: string;
  telefono?: string;
  direccion: string;
  comuna: string;
  ciudad: string;
}

export interface Oportunidad {
  id: number;
  clienteId: number;
  creadoPorId: number;
  titulo: string;
  etapa: EtapaOportunidad;
  montoEstimado: string | number;
  divisaCodigo: string;
  notas: string | null;
  createdAt: string;
  updatedAt: string;
  cliente?: Cliente;
  creadoPor?: { id: number; nombre: string; rol?: string };
}

export interface CreateOportunidadPayload {
  clienteId: number;
  titulo: string;
  etapa?: EtapaOportunidad;
  montoEstimado?: number;
  divisaCodigo?: string;
  notas?: string;
}

export interface TasasDivisa {
  CLP: number;
  USD: number;
  EUR: number;
  CAD: number;
  fechaReferencia: string;
  fuente: string;
}

export type EstadoCotizacionVenta =
  | 'pendiente_aprobacion'
  | 'aprobada'
  | 'rechazada';

export interface CatalogoVentaItem {
  tipo: 'activo';
  id: number;
  sku: string;
  nombre: string;
  modelo: string | null;
  marca: string;
  categoria: string;
  precioVentaClp: number;
  stockDisponible: number;
  habilitadoParaVenta: boolean;
}

export interface CotizacionDetalleLinea {
  activoId: number;
  sku: string;
  nombre: string;
  modelo: string | null;
  marca: string;
  categoria: string;
  cantidad: number;
  /** Precio de referencia en CLP (catálogo o equivalente al editar). */
  precioReferenciaClp: number;
  precioUnitarioPactado: number;
  totalLineaNeto: number;
}

export interface CotizacionDetallePayload {
  activoId: number;
  cantidad: number;
  precioUnitarioPactado: number;
  totalLineaNeto: number;
}

export interface CreateCotizacionPayload {
  clienteId: number;
  oportunidadId?: number;
  divisaCodigo: DivisaCodigo;
  tasaCambioClp: number;
  subtotalNeto: number;
  montoIva: number;
  montoBruto: number;
  comentariosComerciales?: string;
  detalles: CotizacionDetallePayload[];
}

export interface CotizacionVenta {
  id: number;
  folio: string;
  clienteId: number;
  creadoPorId: number;
  oportunidadId: number | null;
  divisaCodigo: DivisaCodigo;
  tasaCambioClp: string | number;
  subtotalNeto: string | number;
  montoIva: string | number;
  montoBruto: string | number;
  comentariosComerciales: string | null;
  estado: EstadoCotizacionVenta;
  createdAt: string;
  cliente?: Cliente;
  creadoPor?: { id: number; nombre: string; rol?: string };
  detalles?: {
    id: number;
    skuEstatico: string;
    nombreEstatico: string;
    categoriaEstatica: string | null;
    cantidad: number;
    precioUnitarioPactado: string | number;
    totalLineaNeto: string | number;
  }[];
}

export interface VentasDashboard {
  oportunidadesTotal: number;
  oportunidadesGanadas: number;
  tasaConversionPct: number;
  ticketPromedioCotizacion: number;
  montoPipelineAbierto: number;
  embudo: { etapa: string; cantidad: number; monto: number }[];
  cotizacionesMesActual: number;
  montoCotizadoMesActual: number;
}

export interface DashboardEjecutivo extends VentasDashboard {
  gastoAcumuladoMantenimiento: number;
  efectividadPe: number;
  mttrHoras: number;
  mtbfHoras: number | null;
  ingresosCotizacionesAprobadas: number;
  cotizacionesAprobadasMes: number;
  stockCriticoRepuestos: number;
  maquinasEnBodegaVenta: number;
}

export interface DashboardComercial extends VentasDashboard {
  ingresosCotizacionesAprobadasMes: number;
  ingresosCotizacionesAprobadasAnio: number;
  cotizacionesAprobadasMes: number;
  maquinasEnBodegaVenta: number;
  valorizacionBodegaComercial: number;
}

export const ESTADO_COTIZACION_LABEL: Record<EstadoCotizacionVenta, string> = {
  pendiente_aprobacion: 'Pendiente aprobación',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
};

export const ETAPAS_OPORTUNIDAD: {
  id: EtapaOportunidad;
  label: string;
}[] = [
  { id: 'prospeccion', label: 'Prospección' },
  { id: 'calificacion', label: 'Calificación' },
  { id: 'propuesta', label: 'Propuesta' },
  { id: 'ganada', label: 'Ganada' },
  { id: 'perdida', label: 'Perdida' },
];

export const ETAPA_LABEL: Record<EtapaOportunidad, string> = {
  prospeccion: 'Prospección',
  calificacion: 'Calificación',
  propuesta: 'Propuesta',
  ganada: 'Ganada',
  perdida: 'Perdida',
};
