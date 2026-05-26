import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Cliente,
  CotizacionVenta,
  DivisaCodigo,
} from '../models/ventas.model';
import { formatDateChile } from '../utils/date-format';

interface PdfLogoAsset {
  dataUrl: string;
  widthPx: number;
  heightPx: number;
}

@Injectable({ providedIn: 'root' })
export class CotizacionPdfService {
  private logoAssetPromise: Promise<PdfLogoAsset | null> | null = null;

  download(
    cotizacion: CotizacionVenta,
    cliente: Cliente,
    ejecutivoNombre?: string,
    logoDataUrl?: string,
  ): void {
    void this.buildAndSave(cotizacion, cliente, ejecutivoNombre, logoDataUrl);
  }

  private async buildAndSave(
    cotizacion: CotizacionVenta,
    cliente: Cliente,
    ejecutivoNombre?: string,
    logoOverride?: string,
  ): Promise<void> {
    const logo = logoOverride
      ? await this.assetFromDataUrl(logoOverride)
      : await this.resolveMindfitLogo();

    const pdf = new jsPDF('p', 'mm', 'a4');
    const divisa = cotizacion.divisaCodigo as DivisaCodigo;
    const fmt = (n: number) => this.formatMoney(n, divisa);

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, 210, 297, 'F');

    const headerTopY = 10;
    const headerMaxHeightMm = 24;

    if (logo) {
      const { widthMm, heightMm } = this.fitLogoDimensionsMm(
        logo.widthPx,
        logo.heightPx,
        32,
        headerMaxHeightMm,
      );
      const logoY = headerTopY + (headerMaxHeightMm - heightMm) / 2;
      pdf.addImage(logo.dataUrl, 'PNG', 14, logoY, widthMm, heightMm);
    } else {
      pdf.setFontSize(16);
      pdf.setTextColor(255, 102, 0);
      pdf.text('Mindfit Ops', 14, headerTopY + 12);
    }

    pdf.setFontSize(10);
    pdf.setTextColor(30, 30, 30);
    pdf.text('Propuesta comercial', 140, 18);
    pdf.setFontSize(14);
    pdf.text(cotizacion.folio, 140, 26);
    pdf.setFontSize(9);
    pdf.text(`Fecha: ${formatDateChile(cotizacion.createdAt)}`, 140, 32);

    pdf.setFontSize(11);
    pdf.text('Cliente', 14, 42);
    pdf.setFontSize(9);
    pdf.text(`${cliente.razonSocial}`, 14, 48);
    pdf.text(`Razón Social (Empresa): ${cliente.razonSocial}`, 14, 53);
    pdf.text(`RUT: ${cliente.rut}`, 14, 58);
    pdf.text(`${cliente.direccion}, ${cliente.comuna}, ${cliente.ciudad}`, 14, 63);
    pdf.text(`Email: ${cliente.email}`, 14, 68);
    if (cliente.telefono) {
      pdf.text(`Tel: ${cliente.telefono}`, 14, 73);
    }

    const ejecutivo =
      ejecutivoNombre?.trim() ||
      cotizacion.creadoPor?.nombre ||
      'Ejecutivo Mindfit Ops';
    pdf.setFontSize(11);
    pdf.text('Ejecutivo de ventas', 140, 42);
    pdf.setFontSize(9);
    pdf.text(ejecutivo, 140, 48);

    const body = (cotizacion.detalles ?? []).map((d) => [
      d.skuEstatico,
      d.nombreEstatico,
      d.categoriaEstatica ?? '—',
      String(d.cantidad),
      fmt(Number(d.precioUnitarioPactado)),
      fmt(Number(d.totalLineaNeto)),
    ]);

    autoTable(pdf, {
      startY: 82,
      head: [
        [
          'SKU',
          'Modelo / Producto',
          'Categoría',
          'Cant.',
          'P. unit.',
          'Total neto',
        ],
      ],
      body,
      styles: { fontSize: 8, textColor: [30, 30, 30] },
      headStyles: { fillColor: [255, 102, 0], textColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    const finalY = (pdf as jsPDF & { lastAutoTable?: { finalY: number } })
      .lastAutoTable?.finalY ?? 120;
    let y = finalY + 10;

    pdf.setFontSize(10);
    pdf.text(`Subtotal neto: ${fmt(Number(cotizacion.subtotalNeto))}`, 130, y);
    y += 6;
    pdf.text(`IVA (19%): ${fmt(Number(cotizacion.montoIva))}`, 130, y);
    y += 6;
    pdf.setFontSize(12);
    pdf.text(`Total bruto: ${fmt(Number(cotizacion.montoBruto))}`, 130, y);
    y += 4;
    pdf.setFontSize(8);
    pdf.text(`Divisa: ${divisa} · Tasa CLP: ${cotizacion.tasaCambioClp}`, 130, y + 5);

    y += 18;
    pdf.setFontSize(9);
    pdf.text('Condiciones comerciales / notas:', 14, y);
    y += 5;
    const notas =
      cotizacion.comentariosComerciales?.trim() ||
      'Validez sujeta a disponibilidad de stock. Plazos de entrega a coordinar.';
    const notasLines = pdf.splitTextToSize(notas, 180);
    pdf.text(notasLines, 14, y);

    y += notasLines.length * 4 + 12;
    pdf.line(14, y, 90, y);
    pdf.line(120, y, 196, y);
    pdf.setFontSize(8);
    pdf.text('Firma cliente', 14, y + 5);
    pdf.text('Ejecutivo Mindfit Ops', 120, y + 5);

    pdf.save(`${cotizacion.folio}.pdf`);
  }

  private resolveMindfitLogo(): Promise<PdfLogoAsset | null> {
    if (!this.logoAssetPromise) {
      this.logoAssetPromise = this.loadMindfitLogo();
    }
    return this.logoAssetPromise;
  }

  private async loadMindfitLogo(): Promise<PdfLogoAsset | null> {
    const candidates = ['/logo2.svg', '/assets/mindfit-logo.png'];
    for (const path of candidates) {
      try {
        return await this.fetchImageAsset(path);
      } catch {
        /* siguiente candidato */
      }
    }
    return null;
  }

  private assetFromDataUrl(dataUrl: string): Promise<PdfLogoAsset> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          dataUrl,
          widthPx: img.naturalWidth || 240,
          heightPx: img.naturalHeight || 240,
        });
      };
      img.onerror = () => reject(new Error('Logo inválido'));
      img.src = dataUrl;
    });
  }

  /** Escala el logo dentro de un recuadro máximo conservando proporción. */
  private fitLogoDimensionsMm(
    widthPx: number,
    heightPx: number,
    maxWidthMm: number,
    maxHeightMm: number,
  ): { widthMm: number; heightMm: number } {
    const ratio = widthPx / heightPx;
    let widthMm = maxWidthMm;
    let heightMm = widthMm / ratio;
    if (heightMm > maxHeightMm) {
      heightMm = maxHeightMm;
      widthMm = heightMm * ratio;
    }
    return {
      widthMm: Math.round(widthMm * 100) / 100,
      heightMm: Math.round(heightMm * 100) / 100,
    };
  }

  private fetchImageAsset(url: string): Promise<PdfLogoAsset> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const widthPx = img.naturalWidth || 240;
        const heightPx = img.naturalHeight || 240;
        const canvas = document.createElement('canvas');
        canvas.width = widthPx;
        canvas.height = heightPx;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No canvas context'));
          return;
        }
        ctx.clearRect(0, 0, widthPx, heightPx);
        ctx.drawImage(img, 0, 0, widthPx, heightPx);
        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          widthPx,
          heightPx,
        });
      };
      img.onerror = () => reject(new Error(`No se pudo cargar ${url}`));
      img.src = url;
    });
  }

  private formatMoney(value: number, divisa: DivisaCodigo): string {
    const rounded = Math.round(value * 100) / 100;
    if (divisa === 'CLP') {
      return `$${rounded.toLocaleString('es-CL', { maximumFractionDigits: 0 })}`;
    }
    const symbol =
      divisa === 'USD' ? 'US$' : divisa === 'EUR' ? '€' : 'CA$';
    return `${symbol}${rounded.toLocaleString('es-CL', { minimumFractionDigits: 2 })}`;
  }
}
