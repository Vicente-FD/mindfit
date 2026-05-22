export enum RolUsuario {
  ADMIN = 'admin',
  JEFE_OPERACIONES = 'jefe_operaciones',
  TECNICO = 'tecnico',
  JEFE_SUCURSAL = 'jefe_sucursal',
  GERENTE_BI = 'gerente_bi',
  BODEGUERO = 'bodeguero',
}

export enum EstadoSesionUsuario {
  CONECTADO = 'conectado',
  DESCONECTADO = 'desconectado',
  REPOSO = 'reposo',
}

export enum CategoriaActivo {
  CARDIO = 'cardio',
  FUERZA = 'fuerza',
  CLIMATIZACION = 'climatizacion',
  INFRAESTRUCTURA = 'infraestructura',
  BOMBA_AGUA = 'bomba_agua',
}

export enum EstadoOperacionalActivo {
  OPERATIVO = 'operativo',
  FUERA_SERVICIO = 'fuera_servicio',
  MANTENIMIENTO_PREVENTIVO = 'mantenimiento_preventivo',
  EN_REPARACION = 'en_reparacion',
}

export enum PrioridadOrden {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
}

export enum TipoMantenimiento {
  CORRECTIVO = 'correctivo',
  PREVENTIVO = 'preventivo',
}

export enum EstadoOrdenTrabajo {
  PENDIENTE = 'pendiente',
  ASIGNADA = 'asignada',
  EN_PROCESO = 'en_proceso',
  FINALIZADA = 'finalizada',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
}

export enum ClasificacionOrden {
  MAQUINA = 'maquina',
  INFRAESTRUCTURA = 'infraestructura',
  PETICION = 'peticion',
}

export enum TipoEvidencia {
  ANTES = 'antes',
  DESPUES = 'despues',
}

export enum OperacionAuditoria {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum TipoMovimientoInventario {
  INGRESO_COMPRA = 'ingreso_compra',
  AJUSTE_MANUAL_POSITIVO = 'ajuste_manual_positivo',
  AJUSTE_MANUAL_NEGATIVO = 'ajuste_manual_negativo',
  CONSUMO_OT = 'consumo_ot',
}

export { EstadoRendicionGasto } from './estado-rendicion-gasto.enum';
