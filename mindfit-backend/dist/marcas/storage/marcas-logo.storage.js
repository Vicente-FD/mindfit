"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marcasLogoStorage = void 0;
exports.ensureMarcasUploadDir = ensureMarcasUploadDir;
exports.buildMarcaLogoUrl = buildMarcaLogoUrl;
const fs_1 = require("fs");
const multer_1 = require("multer");
const path_1 = require("path");
const UPLOAD_DIR = (0, path_1.join)(process.cwd(), 'uploads', 'marcas');
function ensureMarcasUploadDir() {
    if (!(0, fs_1.existsSync)(UPLOAD_DIR)) {
        (0, fs_1.mkdirSync)(UPLOAD_DIR, { recursive: true });
    }
}
exports.marcasLogoStorage = (0, multer_1.diskStorage)({
    destination: (_req, _file, cb) => {
        ensureMarcasUploadDir();
        cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = (0, path_1.extname)(file.originalname) || '.png';
        cb(null, `${unique}${ext}`);
    },
});
function buildMarcaLogoUrl(filename, port = 3000) {
    return `http://127.0.0.1:${port}/uploads/marcas/${filename}`;
}
//# sourceMappingURL=marcas-logo.storage.js.map