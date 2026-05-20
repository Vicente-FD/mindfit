import { Injectable } from '@angular/core';

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

const DEFAULT_OPTIONS: Required<ImageCompressionOptions> = {
  maxWidth: 1280,
  maxHeight: 720,
  quality: 0.8,
  mimeType: 'image/webp',
};

@Injectable({ providedIn: 'root' })
export class ImageCompressorService {
  async compress(
    file: File,
    options: ImageCompressionOptions = {},
  ): Promise<File> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo seleccionado no es una imagen válida');
    }

    const bitmap = await createImageBitmap(file);
    const { width, height } = this.fitWithin(
      bitmap.width,
      bitmap.height,
      opts.maxWidth,
      opts.maxHeight,
    );

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      throw new Error('No se pudo inicializar el contexto Canvas');
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error('Error al comprimir la imagen'));
            return;
          }
          resolve(result);
        },
        opts.mimeType,
        opts.quality,
      );
    });

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'evidencia';
    return new File([blob], `${baseName}.webp`, {
      type: opts.mimeType,
      lastModified: Date.now(),
    });
  }

  private fitWithin(
    srcWidth: number,
    srcHeight: number,
    maxWidth: number,
    maxHeight: number,
  ): { width: number; height: number } {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight, 1);
    return {
      width: Math.round(srcWidth * ratio),
      height: Math.round(srcHeight * ratio),
    };
  }
}
