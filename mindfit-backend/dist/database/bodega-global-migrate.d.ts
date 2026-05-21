export interface DbConnectionConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}
export declare function runBodegaGlobalPreMigrate(config: DbConnectionConfig): Promise<void>;
