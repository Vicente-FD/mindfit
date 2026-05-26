-- Mindfit Ops — ERP/CRM Ventas (ejecutar en pgAdmin sobre mindfit_ops)

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check
CHECK (rol IN (
  'admin', 'jefe_operaciones', 'tecnico', 'jefe_sucursal',
  'gerente_bi', 'bodeguero', 'ejecutivo_ventas'
));

ALTER TABLE activos ADD COLUMN IF NOT EXISTS apto_para_venta BOOLEAN DEFAULT FALSE;
ALTER TABLE activos ADD COLUMN IF NOT EXISTS precio_venta_clp NUMERIC(12, 2) DEFAULT 0.00;

ALTER TABLE repuestos ADD COLUMN IF NOT EXISTS apto_para_venta BOOLEAN DEFAULT FALSE;
ALTER TABLE repuestos ADD COLUMN IF NOT EXISTS precio_venta_clp NUMERIC(12, 2) DEFAULT 0.00;

CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    rut VARCHAR(15) NOT NULL UNIQUE,
    razon_social VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(30),
    direccion VARCHAR(200) NOT NULL,
    comuna VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS oportunidades (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    creado_por_id INT NOT NULL REFERENCES usuarios(id),
    titulo VARCHAR(150) NOT NULL,
    etapa VARCHAR(30) NOT NULL DEFAULT 'prospeccion'
        CHECK (etapa IN ('prospeccion', 'calificacion', 'propuesta', 'ganada', 'perdida')),
    monto_estimado NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    divisa_codigo VARCHAR(3) NOT NULL DEFAULT 'CLP',
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cotizaciones_ventas (
    id SERIAL PRIMARY KEY,
    folio VARCHAR(50) NOT NULL UNIQUE,
    cliente_id INT NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    creado_por_id INT NOT NULL REFERENCES usuarios(id),
    oportunidad_id INT NULL REFERENCES oportunidades(id) ON DELETE SET NULL,
    divisa_codigo VARCHAR(3) NOT NULL DEFAULT 'CLP',
    tasa_cambio_clp NUMERIC(12, 6) NOT NULL DEFAULT 1.000000,
    subtotal_neto NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    monto_iva NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    monto_bruto NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    comentarios_comerciales TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cotizacion_ventas_detalles (
    id SERIAL PRIMARY KEY,
    cotizacion_id INT NOT NULL REFERENCES cotizaciones_ventas(id) ON DELETE CASCADE,
    activo_id INT NULL REFERENCES activos(id) ON DELETE RESTRICT,
    repuesto_id INT NULL REFERENCES repuestos(id) ON DELETE RESTRICT,
    sku_estatico VARCHAR(50) NOT NULL,
    nombre_estatico VARCHAR(150) NOT NULL,
    categoria_estatica VARCHAR(100) NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario_pactado NUMERIC(12, 2) NOT NULL,
    total_linea_neto NUMERIC(12, 2) NOT NULL,
    costo_historico_clp NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT chk_item_origen CHECK (
        (activo_id IS NOT NULL AND repuesto_id IS NULL) OR
        (activo_id IS NULL AND repuesto_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_oportunidades_etapa ON oportunidades (etapa);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_cliente ON cotizaciones_ventas (cliente_id);
