export declare function ensureBoletasUploadDir(): void;
export declare const boletasMulterStorage: import("multer").StorageEngine;
export declare function buildBoletaPublicUrl(filename: string, port?: number): string;
export declare function resolveBoletaDiskPath(urlBoleta: string): string | null;
