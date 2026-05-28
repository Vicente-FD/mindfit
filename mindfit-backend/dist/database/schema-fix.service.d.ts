import { OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
export declare class SchemaFixService implements OnModuleInit {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    onModuleInit(): Promise<void>;
    private ensureFlotaLicencias;
    private ensureMonitoreoIndexes;
    private ensureFacilidadesCriticas;
    private ensureSolicitudesPassword;
    private ensureOportunidadesCrm;
    private ensureCotizacionHistorial;
    private ensureRendicionesGastos;
    private ensureOtSchema;
    private ensureMovimientosInventario;
    private ensureCatalogosSchema;
    private ensureActivoEstadoOperacionalEnum;
    private migrateBodegaToGlobal;
    private backfillCodigosInventario;
    private backfillSucursalSiglas;
    private backfillEstadoSesion;
    private columnExists;
}
