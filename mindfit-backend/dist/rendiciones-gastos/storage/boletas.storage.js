"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boletasMulterStorage = void 0;
exports.ensureBoletasUploadDir = ensureBoletasUploadDir;
exports.buildBoletaPublicUrl = buildBoletaPublicUrl;
exports.resolveBoletaDiskPath = resolveBoletaDiskPath;
const fs_1 = require("fs");
const multer_1 = require("multer");
const path_1 = require("path");
const UPLOAD_DIR = (0, path_1.join)(process.cwd(), 'uploads', 'boletas');
const BOLETAS_URL_SEGMENT = '/uploads/boletas/';
function ensureBoletasUploadDir() {
    if (!(0, fs_1.existsSync)(UPLOAD_DIR)) {
        (0, fs_1.mkdirSync)(UPLOAD_DIR, { recursive: true });
    }
}
exports.boletasMulterStorage = (0, multer_1.diskStorage)({
    destination: (_req, _file, cb) => {
        ensureBoletasUploadDir();
        cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = (0, path_1.extname)(file.originalname) || '.webp';
        cb(null, `${unique}${ext}`);
    },
});
function buildBoletaPublicUrl(filename, port = 3000) {
    return `http://127.0.0.1:${port}/uploads/boletas/${filename}`;
}
function resolveBoletaDiskPath(urlBoleta) {
    if (!urlBoleta?.trim())
        return null;
    const idx = urlBoleta.indexOf(BOLETAS_URL_SEGMENT);
    if (idx === -1) {
        const name = (0, path_1.basename)(urlBoleta.split('?')[0] ?? '');
        if (!name || name === '.' || name === '..')
            return null;
        return (0, path_1.join)(UPLOAD_DIR, name);
    }
    const filename = urlBoleta
        .slice(idx + BOLETAS_URL_SEGMENT.length)
        .split('?')[0]
        .split('#')[0];
    if (!filename || filename.includes('..') || filename.includes('/')) {
        return null;
    }
    return (0, path_1.join)(UPLOAD_DIR, filename);
}
//# sourceMappingURL=boletas.storage.js.map