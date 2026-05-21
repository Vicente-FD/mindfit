import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { basename, extname, join } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'evidencias');
const EVIDENCIAS_URL_SEGMENT = '/uploads/evidencias/';

export function ensureUploadDir(): void {
  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export const evidenciasMulterStorage = diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = extname(file.originalname) || '.webp';
    cb(null, `${unique}${ext}`);
  },
});

export function buildPublicFileUrl(filename: string, port = 3000): string {
  return `http://127.0.0.1:${port}/uploads/evidencias/${filename}`;
}

/** Resuelve la ruta absoluta en disco a partir de la URL pública guardada en BD. */
export function resolveEvidenciaDiskPath(urlImagen: string): string | null {
  if (!urlImagen?.trim()) return null;

  const idx = urlImagen.indexOf(EVIDENCIAS_URL_SEGMENT);
  if (idx === -1) {
    const name = basename(urlImagen.split('?')[0] ?? '');
    if (!name || name === '.' || name === '..') return null;
    return join(UPLOAD_DIR, name);
  }

  const filename = urlImagen
    .slice(idx + EVIDENCIAS_URL_SEGMENT.length)
    .split('?')[0]
    .split('#')[0];

  if (!filename || filename.includes('..') || filename.includes('/')) {
    return null;
  }

  return join(UPLOAD_DIR, filename);
}
