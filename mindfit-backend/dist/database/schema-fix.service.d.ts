import { OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
export declare class SchemaFixService implements OnModuleInit {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    onModuleInit(): Promise<void>;
    private ensureOtSchema;
    private migrateBodegaToGlobal;
    private backfillCodigosInventario;
    private backfillSucursalSiglas;
    private backfillEstadoSesion;
    private columnExists;
}
