export declare enum RolUsuario {
    ADMIN = "admin",
    JEFE_OPERACIONES = "jefe_operaciones",
    TECNICO = "tecnico",
    JEFE_SUCURSAL = "jefe_sucursal",
    GERENTE_BI = "gerente_bi",
    BODEGUERO = "bodeguero"
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
    MANTENIMIENTO_PREVENTIVO = "mantenimiento_preventivo"
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
    APROBADA = "aprobada"
}
export declare enum ClasificacionOrden {
    MAQUINA = "maquina",
    INFRAESTRUCTURA = "infraestructura"
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
