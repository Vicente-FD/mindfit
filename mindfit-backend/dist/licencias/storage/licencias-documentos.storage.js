"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.licenciasDocumentoMulterStorage = void 0;
exports.ensureLicenciasUploadDir = ensureLicenciasUploadDir;
exports.licenciasDocumentoFileFilter = licenciasDocumentoFileFilter;
exports.buildLicenciaPublicUrl = buildLicenciaPublicUrl;
exports.resolveLicenciaDiskPath = resolveLicenciaDiskPath;
const fs_1 = require("fs");
const multer_1 = require("multer");
const path_1 = require("path");
const UPLOAD_DIR = (0, path_1.join)(process.cwd(), 'uploads', 'licencias');
const LICENCIAS_URL_SEGMENT = '/uploads/licencias/';
const ALLOWED_EXT = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp']);
function ensureLicenciasUploadDir() {
    if (!(0, fs_1.existsSync)(UPLOAD_DIR)) {
        (0, fs_1.mkdirSync)(UPLOAD_DIR, { recursive: true });
    }
}
exports.licenciasDocumentoMulterStorage = (0, multer_1.diskStorage)({
    destination: (_req, _file, cb) => {
        ensureLicenciasUploadDir();
        cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = (0, path_1.extname)(file.originalname).toLowerCase() || '.pdf';
        cb(null, `${unique}${ext}`);
    },
});
function licenciasDocumentoFileFilter(_req, file, cb) {
    const ext = (0, path_1.extname)(file.originalname).toLowerCase();
    const mimeOk = file.mimetype === 'application/pdf' ||
        file.mimetype.startsWith('image/');
    if (!mimeOk || !ALLOWED_EXT.has(ext)) {
        cb(new Error('Solo se permiten archivos PDF o imagen (JPG, PNG, WEBP)'), false);
        return;
    }
    cb(null, true);
}
function buildLicenciaPublicUrl(filename) {
    return `${LICENCIAS_URL_SEGMENT}${filename}`;
}
function resolveLicenciaDiskPath(documentoUrl) {
    if (!documentoUrl?.trim())
        return null;
    const idx = documentoUrl.indexOf(LICENCIAS_URL_SEGMENT);
    if (idx === -1) {
        const name = (0, path_1.basename)(documentoUrl.split('?')[0] ?? '');
        if (!name || name === '.' || name === '..')
            return null;
        return (0, path_1.join)(UPLOAD_DIR, name);
    }
    const filename = documentoUrl
        .slice(idx + LICENCIAS_URL_SEGMENT.length)
        .split('?')[0]
        .split('#')[0];
    if (!filename || filename.includes('..') || filename.includes('/')) {
        return null;
    }
    return (0, path_1.join)(UPLOAD_DIR, filename);
}
//# sourceMappingURL=licencias-documentos.storage.js.map