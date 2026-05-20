import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'evidencias');

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
