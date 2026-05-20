"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evidenciasMulterStorage = void 0;
exports.ensureUploadDir = ensureUploadDir;
exports.buildPublicFileUrl = buildPublicFileUrl;
const fs_1 = require("fs");
const multer_1 = require("multer");
const path_1 = require("path");
const UPLOAD_DIR = (0, path_1.join)(process.cwd(), 'uploads', 'evidencias');
function ensureUploadDir() {
    if (!(0, fs_1.existsSync)(UPLOAD_DIR)) {
        (0, fs_1.mkdirSync)(UPLOAD_DIR, { recursive: true });
    }
}
exports.evidenciasMulterStorage = (0, multer_1.diskStorage)({
    destination: (_req, _file, cb) => {
        ensureUploadDir();
        cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = (0, path_1.extname)(file.originalname) || '.webp';
        cb(null, `${unique}${ext}`);
    },
});
function buildPublicFileUrl(filename, port = 3000) {
    return `http://127.0.0.1:${port}/uploads/evidencias/${filename}`;
}
//# sourceMappingURL=evidencias.storage.js.map