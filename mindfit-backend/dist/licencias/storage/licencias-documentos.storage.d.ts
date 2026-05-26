export declare function ensureLicenciasUploadDir(): void;
export declare const licenciasDocumentoMulterStorage: import("multer").StorageEngine;
export declare function licenciasDocumentoFileFilter(_req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void): void;
export declare function buildLicenciaPublicUrl(filename: string): string;
export declare function resolveLicenciaDiskPath(documentoUrl: string): string | null;
