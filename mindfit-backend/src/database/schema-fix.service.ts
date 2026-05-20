import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Rellena columnas nuevas en datos existentes tras synchronize (columnas nullable).
 * Evita el error "codigo_inventario contiene valores null" al pasar a NOT NULL.
 */
@Injectable()
export class SchemaFixService implements OnModuleInit {
  private readonly logger = new Logger(SchemaFixService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    await this.backfillCodigosInventario();
    await this.backfillSucursalSiglas();
    await this.backfillEstadoSesion();
  }

  private async backfillCodigosInventario(): Promise<void> {
    const hasQr = await this.columnExists('activos', 'codigo_qr_token');
    if (!hasQr) return;

    await this.dataSource.query(`
      UPDATE activos
      SET codigo_qr_token = codigo_inventario
      WHERE (codigo_qr_token IS NULL OR codigo_qr_token = '')
        AND codigo_inventario IS NOT NULL
        AND codigo_inventario <> ''
    `);

    await this.dataSource.query(`
      UPDATE activos
      SET codigo_inventario = LEFT(codigo_qr_token, 32)
      WHERE (codigo_inventario IS NULL OR codigo_inventario = '')
        AND codigo_qr_token IS NOT NULL
        AND codigo_qr_token <> ''
    `);

    await this.dataSource.query(`
      UPDATE activos
      SET
        codigo_qr_token = UPPER(SUBSTRING(REPLACE(uuid_activo::text, '-', '') FROM 1 FOR 12)),
        codigo_inventario = UPPER(SUBSTRING(REPLACE(uuid_activo::text, '-', '') FROM 1 FOR 12))
      WHERE codigo_qr_token IS NULL OR codigo_qr_token = ''
    `);

    const remaining = await this.dataSource.query(`
      SELECT COUNT(*)::int AS n FROM activos
      WHERE codigo_qr_token IS NULL OR codigo_qr_token = ''
    `);
    if (remaining[0]?.n > 0) {
      this.logger.warn(
        `Quedan ${remaining[0].n} activos sin código QR; revise manualmente`,
      );
    } else {
      this.logger.log('Códigos de activos (QR + inventario) backfill completado');
    }
  }

  private async backfillSucursalSiglas(): Promise<void> {
    const hasColumn = await this.columnExists('sucursales', 'sigla');
    if (!hasColumn) return;

    await this.dataSource.query(`
      UPDATE sucursales SET sigla = 'LF' WHERE nombre ILIKE '%La Florida%' AND (sigla IS NULL OR sigla = '');
      UPDATE sucursales SET sigla = 'LC' WHERE nombre ILIKE '%Las Condes%' AND (sigla IS NULL OR sigla = '');
      UPDATE sucursales SET sigla = 'VM' WHERE nombre ILIKE '%Viña del Mar%' AND (sigla IS NULL OR sigla = '');
      UPDATE sucursales SET sigla = 'CC' WHERE nombre ILIKE '%Central%' AND (sigla IS NULL OR sigla = '');
      UPDATE sucursales SET sigla = 'GN' WHERE sigla IS NULL OR sigla = '';
    `);
  }

  private async backfillEstadoSesion(): Promise<void> {
    const hasColumn = await this.columnExists('usuarios', 'estado_sesion');
    if (!hasColumn) return;

    await this.dataSource.query(`
      UPDATE usuarios SET estado_sesion = 'desconectado' WHERE estado_sesion IS NULL;
    `);
  }

  private async columnExists(
    table: string,
    column: string,
  ): Promise<boolean> {
    const rows = await this.dataSource.query(
      `
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
      `,
      [table, column],
    );
    return rows.length > 0;
  }
}
