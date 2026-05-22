import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { basename, extname, join } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'boletas');
const BOLETAS_URL_SEGMENT = '/uploads/boletas/';

export function ensureBoletasUploadDir(): void {
  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export const boletasMulterStorage = diskStorage({
  destination: (_req, _file, cb) => {
    ensureBoletasUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = extname(file.originalname) || '.webp';
    cb(null, `${unique}${ext}`);
  },
});

export function buildBoletaPublicUrl(filename: string, port = 3000): string {
  return `http://127.0.0.1:${port}/uploads/boletas/${filename}`;
}

export function resolveBoletaDiskPath(urlBoleta: string): string | null {
  if (!urlBoleta?.trim()) return null;

  const idx = urlBoleta.indexOf(BOLETAS_URL_SEGMENT);
  if (idx === -1) {
    const name = basename(urlBoleta.split('?')[0] ?? '');
    if (!name || name === '.' || name === '..') return null;
    return join(UPLOAD_DIR, name);
  }

  const filename = urlBoleta
    .slice(idx + BOLETAS_URL_SEGMENT.length)
    .split('?')[0]
    .split('#')[0];

  if (!filename || filename.includes('..') || filename.includes('/')) {
    return null;
  }

  return join(UPLOAD_DIR, filename);
}
