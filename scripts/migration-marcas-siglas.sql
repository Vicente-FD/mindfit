-- Mindfit Ops: migración segura (ejecutar con psql si synchronize falla)
-- psql -U postgres -d mindfit_ops -f migration-marcas-siglas.sql

CREATE TABLE IF NOT EXISTS marcas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    sigla VARCHAR(5) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO marcas (nombre, sigla) VALUES
('Matrix', 'MX'),
('Life Fitness', 'LF'),
('Precor', 'PR'),
('Technogym', 'TG'),
('Carrier', 'CR'),
('Pedrollo', 'PD')
ON CONFLICT DO NOTHING;

-- Sucursales: columna nullable primero, luego datos, luego NOT NULL opcional
ALTER TABLE sucursales ADD COLUMN IF NOT EXISTS sigla VARCHAR(5);
UPDATE sucursales SET sigla = 'LF' WHERE nombre ILIKE '%La Florida%' AND (sigla IS NULL OR sigla = '');
UPDATE sucursales SET sigla = 'LC' WHERE nombre ILIKE '%Las Condes%' AND (sigla IS NULL OR sigla = '');
UPDATE sucursales SET sigla = 'VM' WHERE nombre ILIKE '%Viña del Mar%' AND (sigla IS NULL OR sigla = '');
UPDATE sucursales SET sigla = 'CC' WHERE nombre ILIKE '%Central%' AND (sigla IS NULL OR sigla = '');
UPDATE sucursales SET sigla = 'GN' WHERE sigla IS NULL OR sigla = '';

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS estado_sesion VARCHAR(20) DEFAULT 'desconectado';
UPDATE usuarios SET estado_sesion = 'desconectado' WHERE estado_sesion IS NULL;
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_estado_sesion_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_estado_sesion_check
  CHECK (estado_sesion IN ('conectado', 'desconectado', 'reposo'));

UPDATE usuarios SET estado_sesion = 'conectado' WHERE email = 'jefe.ops@mindfit.cl';
UPDATE usuarios SET estado_sesion = 'reposo' WHERE email = 'tecnico@mindfit.cl';
UPDATE usuarios SET estado_sesion = 'desconectado' WHERE email = 'jefe.florida@mindfit.cl';

ALTER TABLE activos ADD COLUMN IF NOT EXISTS marca_id INT REFERENCES marcas(id) ON DELETE SET NULL;

-- codigo_inventario: SIEMPRE nullable al crear, rellenar, luego unique index
ALTER TABLE activos ADD COLUMN IF NOT EXISTS codigo_inventario VARCHAR(32);

UPDATE activos
SET codigo_inventario = codigo_qr_token
WHERE codigo_inventario IS NULL
  AND codigo_qr_token IS NOT NULL
  AND codigo_qr_token <> '';

UPDATE activos
SET
  codigo_inventario = UPPER(SUBSTRING(REPLACE(uuid_activo::text, '-', '') FROM 1 FOR 12)),
  codigo_qr_token = COALESCE(
    NULLIF(codigo_qr_token, ''),
    UPPER(SUBSTRING(REPLACE(uuid_activo::text, '-', '') FROM 1 FOR 12))
  )
WHERE codigo_inventario IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_activos_codigo_inventario
  ON activos(codigo_inventario)
  WHERE codigo_inventario IS NOT NULL;
