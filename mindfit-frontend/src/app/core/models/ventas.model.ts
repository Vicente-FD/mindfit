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

export interface Oportunidad {
  id: number;
  clienteId: number;
  creadoPorId: number;
  titulo: string;
  etapa: EtapaOportunidad;
  montoEstimado: string | number;
  divisaCodigo: string;
  notas: string | null;
  fechaCierreEstimada: string | null;
  checklist: OportunidadChecklistItem[];
  actividades: OportunidadActividad[];
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
  fechaCierreEstimada?: string | null;
}

export interface UpdateOportunidadPayload {
  titulo?: string;
  etapa?: EtapaOportunidad;
  montoEstimado?: number;
  divisaCodigo?: string;
  notas?: string;
  fechaCierreEstimada?: string | null;
  checklist?: OportunidadChecklistItem[];
  actividades?: OportunidadActividad[];
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

export interface UpdateCotizacionPayload {
  divisaCodigo?: DivisaCodigo;
  tasaCambioClp?: number;
  subtotalNeto?: number;
  montoIva?: number;
  montoBruto?: number;
  comentariosComerciales?: string;
  detalles?: CotizacionDetallePayload[];
}

export type TipoHistorialCotizacion =
  | 'creacion'
  | 'edicion'
  | 'cambio_estado';

export interface CotizacionHistorialEntry {
  id: number;
  cotizacionId: number;
  usuarioId: number | null;
  tipo: TipoHistorialCotizacion;
  resumen: string;
  cambios: Record<string, unknown> | null;
  createdAt: string;
  usuario?: { id: number; nombre: string };
}

export const TIPO_HISTORIAL_COTIZ_LABEL: Record<TipoHistorialCotizacion, string> = {
  creacion: 'Creación',
  edicion: 'Edición',
  cambio_estado: 'Cambio de estado',
};

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
    activoId?: number | null;
    skuEstatico: string;
    nombreEstatico: string;
    categoriaEstatica: string | null;
    cantidad: number;
    precioUnitarioPactado: string | number;
    totalLineaNeto: string | number;
    costoHistoricoClp?: string | number;
    activo?: { id: number; nombre: string };
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
