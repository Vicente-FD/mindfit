import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { basename, extname, join } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'licencias');
const LICENCIAS_URL_SEGMENT = '/uploads/licencias/';

const ALLOWED_EXT = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp']);

export function ensureLicenciasUploadDir(): void {
  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export const licenciasDocumentoMulterStorage = diskStorage({
  destination: (_req, _file, cb) => {
    ensureLicenciasUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = extname(file.originalname).toLowerCase() || '.pdf';
    cb(null, `${unique}${ext}`);
  },
});

export function licenciasDocumentoFileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
): void {
  const ext = extname(file.originalname).toLowerCase();
  const mimeOk =
    file.mimetype === 'application/pdf' ||
    file.mimetype.startsWith('image/');
  if (!mimeOk || !ALLOWED_EXT.has(ext)) {
    cb(new Error('Solo se permiten archivos PDF o imagen (JPG, PNG, WEBP)'), false);
    return;
  }
  cb(null, true);
}

export function buildLicenciaPublicUrl(filename: string): string {
  return `${LICENCIAS_URL_SEGMENT}${filename}`;
}

export function resolveLicenciaDiskPath(documentoUrl: string): string | null {
  if (!documentoUrl?.trim()) return null;

  const idx = documentoUrl.indexOf(LICENCIAS_URL_SEGMENT);
  if (idx === -1) {
    const name = basename(documentoUrl.split('?')[0] ?? '');
    if (!name || name === '.' || name === '..') return null;
    return join(UPLOAD_DIR, name);
  }

  const filename = documentoUrl
    .slice(idx + LICENCIAS_URL_SEGMENT.length)
    .split('?')[0]
    .split('#')[0];

  if (!filename || filename.includes('..') || filename.includes('/')) {
    return null;
  }

  return join(UPLOAD_DIR, filename);
}
