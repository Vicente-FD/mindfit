-- Kardex de trazabilidad — ejecutar en mindfit_ops (pgAdmin)
-- También se aplica automáticamente al iniciar NestJS vía SchemaFixService.

CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id SERIAL PRIMARY KEY,
    sucursal_id INT NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
    repuesto_id INT NOT NULL REFERENCES repuestos(id) ON DELETE CASCADE,
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    tipo_movimiento VARCHAR(30) NOT NULL CHECK (
        tipo_movimiento IN (
            'ingreso_compra',
            'ajuste_manual_positivo',
            'ajuste_manual_negativo',
            'consumo_ot'
        )
    ),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    costo_unitario_momento NUMERIC(12, 2) NOT NULL,
    orden_trabajo_id INT NULL REFERENCES ordenes_trabajo(id) ON DELETE SET NULL,
    motivo TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE repuestos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_movimientos_repuesto ON movimientos_inventario (repuesto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_sucursal ON movimientos_inventario (sucursal_id);
