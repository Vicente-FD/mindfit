export declare enum RolUsuario {
    ADMIN = "admin",
    JEFE_OPERACIONES = "jefe_operaciones",
    TECNICO = "tecnico",
    JEFE_SUCURSAL = "jefe_sucursal",
    GERENTE_BI = "gerente_bi",
    BODEGUERO = "bodeguero",
    EJECUTIVO_VENTAS = "ejecutivo_ventas"
}
export declare enum EtapaOportunidad {
    PROSPECCION = "prospeccion",
    CALIFICACION = "calificacion",
    PROPUESTA = "propuesta",
    GANADA = "ganada",
    PERDIDA = "perdida"
}
export declare enum DivisaCodigo {
    CLP = "CLP",
    USD = "USD",
    EUR = "EUR",
    CAD = "CAD"
}
export declare enum EstadoSesionUsuario {
    CONECTADO = "conectado",
    DESCONECTADO = "desconectado",
    REPOSO = "reposo"
}
export declare enum CategoriaActivo {
    CARDIO = "cardio",
    FUERZA = "fuerza",
    CLIMATIZACION = "climatizacion",
    INFRAESTRUCTURA = "infraestructura",
    BOMBA_AGUA = "bomba_agua"
}
export declare enum EstadoOperacionalActivo {
    OPERATIVO = "operativo",
    FUERA_SERVICIO = "fuera_servicio",
    MANTENIMIENTO_PREVENTIVO = "mantenimiento_preventivo",
    EN_REPARACION = "en_reparacion",
    RESERVADO_VENTA = "reservado_venta",
    VENDIDO = "vendido"
}
export declare enum EstadoCotizacionVenta {
    PENDIENTE_APROBACION = "pendiente_aprobacion",
    APROBADA = "aprobada",
    RECHAZADA = "rechazada"
}
export declare enum PrioridadOrden {
    BAJA = "baja",
    MEDIA = "media",
    ALTA = "alta"
}
export declare enum TipoMantenimiento {
    CORRECTIVO = "correctivo",
    PREVENTIVO = "preventivo"
}
export declare enum EstadoOrdenTrabajo {
    PENDIENTE = "pendiente",
    ASIGNADA = "asignada",
    EN_PROCESO = "en_proceso",
    FINALIZADA = "finalizada",
    APROBADA = "aprobada",
    RECHAZADA = "rechazada"
}
export declare enum ClasificacionOrden {
    MAQUINA = "maquina",
    INFRAESTRUCTURA = "infraestructura",
    PETICION = "peticion"
}
export declare enum TipoEvidencia {
    ANTES = "antes",
    DESPUES = "despues"
}
export declare enum OperacionAuditoria {
    INSERT = "INSERT",
    UPDATE = "UPDATE",
    DELETE = "DELETE"
}
export declare enum TipoMovimientoInventario {
    INGRESO_COMPRA = "ingreso_compra",
    AJUSTE_MANUAL_POSITIVO = "ajuste_manual_positivo",
    AJUSTE_MANUAL_NEGATIVO = "ajuste_manual_negativo",
    CONSUMO_OT = "consumo_ot",
    VENTA_COTIZACION = "venta_cotizacion"
}
export { EstadoRendicionGasto } from './estado-rendicion-gasto.enum';
