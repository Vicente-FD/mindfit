-- Mindfit Ops — Bodega Central, reservas de venta y aprobación de cotizaciones

-- 1) Activos en Bodega Central (sucursal opcional)
ALTER TABLE activos ALTER COLUMN sucursal_id DROP NOT NULL;

-- 2) Nuevos estados operacionales de activo
DO $$
DECLARE
  enum_name text;
BEGIN
  SELECT t.typname INTO enum_name
  FROM pg_attribute a
  JOIN pg_class c ON c.oid = a.attrelid
  JOIN pg_type t ON t.oid = a.atttypid
  WHERE c.relname = 'activos' AND a.attname = 'estado_operacional'
  LIMIT 1;

  IF enum_name IS NOT NULL THEN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = enum_name AND e.enumlabel = 'reservado_venta'
  ) THEN
    EXECUTE format('ALTER TYPE %I ADD VALUE ''reservado_venta''', enum_name);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = enum_name AND e.enumlabel = 'vendido'
  ) THEN
    EXECUTE format('ALTER TYPE %I ADD VALUE ''vendido''', enum_name);
  END IF;
  END IF;
END $$;

-- 3) Estado de cotización comercial
ALTER TABLE cotizaciones_ventas
  ADD COLUMN IF NOT EXISTS estado VARCHAR(30) NOT NULL DEFAULT 'pendiente_aprobacion';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cotizaciones_ventas_estado_check'
  ) THEN
    ALTER TABLE cotizaciones_ventas
      ADD CONSTRAINT cotizaciones_ventas_estado_check
      CHECK (estado IN ('pendiente_aprobacion', 'aprobada', 'rechazada'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cotizaciones_estado ON cotizaciones_ventas (estado);
