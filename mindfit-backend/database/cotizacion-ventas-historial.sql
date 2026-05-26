-- Historial de cambios en cotizaciones comerciales
CREATE TABLE IF NOT EXISTS cotizacion_ventas_historial (
  id SERIAL PRIMARY KEY,
  cotizacion_id INT NOT NULL REFERENCES cotizaciones_ventas(id) ON DELETE CASCADE,
  usuario_id INT NULL REFERENCES usuarios(id) ON DELETE SET NULL,
  tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('creacion', 'edicion', 'cambio_estado')),
  resumen TEXT NOT NULL,
  cambios JSONB NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cotiz_historial_cotizacion
  ON cotizacion_ventas_historial (cotizacion_id, created_at DESC);
