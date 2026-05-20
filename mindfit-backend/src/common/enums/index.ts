export enum RolUsuario {
  ADMIN = 'admin',
  JEFE_OPERACIONES = 'jefe_operaciones',
  TECNICO = 'tecnico',
  JEFE_SUCURSAL = 'jefe_sucursal',
  GERENTE_BI = 'gerente_bi',
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
