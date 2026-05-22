-- Rendiciones de gastos de técnicos (caja chica en terreno)
-- Ejecutar en pgAdmin si no usa schema-fix automático al arranque.

CREATE TABLE IF NOT EXISTS rendiciones_gastos (
    id SERIAL PRIMARY KEY,
    tecnico_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    monto NUMERIC(12, 2) NOT NULL CHECK (monto > 0),
    descripcion TEXT NOT NULL,
    url_boleta TEXT NOT NULL,
    estado VARCHAR(30) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
    motivo_rechazo TEXT NULL,
    fecha_gasto DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gastos_tecnico_fecha ON rendiciones_gastos (tecnico_id, fecha_gasto);
CREATE INDEX IF NOT EXISTS idx_gastos_estado ON rendiciones_gastos (estado);
