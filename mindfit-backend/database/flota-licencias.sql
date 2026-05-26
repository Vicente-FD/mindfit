-- Control de Flota y Licencias (Mindfit Ops)
-- Ejecutar en pgAdmin sobre mindfit_ops si no usa synchronize / schema-fix.

CREATE TABLE IF NOT EXISTS vehiculos (
    id SERIAL PRIMARY KEY,
    patente VARCHAR(15) NOT NULL UNIQUE,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    anio INT NOT NULL,
    kilometraje_actual INT NOT NULL DEFAULT 0 CHECK (kilometraje_actual >= 0),
    siguiente_cambio_aceite_km INT NOT NULL DEFAULT 0 CHECK (siguiente_cambio_aceite_km >= 0),
    sucursal_id INT NULL REFERENCES sucursales(id) ON DELETE SET NULL,
    conductor_id INT NULL REFERENCES usuarios(id) ON DELETE SET NULL,
    vencimiento_soap DATE NOT NULL,
    vencimiento_permiso DATE NOT NULL,
    vencimiento_revision DATE NOT NULL,
    documentos_urls JSONB NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS licencias_tecnicos (
    id SERIAL PRIMARY KEY,
    tecnico_id INT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_licencia VARCHAR(30) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    documento_url TEXT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehiculos_vencimientos
  ON vehiculos (vencimiento_soap, vencimiento_permiso, vencimiento_revision);

CREATE INDEX IF NOT EXISTS idx_licencias_vencimiento
  ON licencias_tecnicos (fecha_vencimiento);
