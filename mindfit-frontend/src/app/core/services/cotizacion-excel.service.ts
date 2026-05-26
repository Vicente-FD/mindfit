import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Cliente, CotizacionVenta } from '../models/ventas.model';

@Injectable({ providedIn: 'root' })
export class CotizacionExcelService {
  download(cotizacion: CotizacionVenta, cliente: Cliente): void {
    const wb = XLSX.utils.book_new();
    const fecha = new Date(cotizacion.createdAt).toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const rows: (string | number)[][] = [
      ['MINDFIT OPS — Catálogo comercial'],
      [fecha],
      [cliente.razonSocial],
      [],
      ['🔒 MINDFIT OPS - EQUIPO CERTIFICADO'],
      [],
      ['SKU', 'Modelo / Producto', 'Marca', 'Categoría', 'Cantidad'],
    ];

    for (const d of cotizacion.detalles ?? []) {
      const parts = d.nombreEstatico.split(' ');
      rows.push([
        d.skuEstatico,
        d.nombreEstatico,
        parts[0] ?? '—',
        d.categoriaEstatica ?? 'Equipo',
        d.cantidad,
      ]);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 18 }, { wch: 32 }, { wch: 16 }, { wch: 18 }, { wch: 10 }];

    const stampCell = 'A5';
    if (ws[stampCell]) {
      ws[stampCell].s = {
        fill: { fgColor: { rgb: 'FF6600' } },
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 12 },
        border: {
          top: { style: 'thick', color: { rgb: 'CC5200' } },
          bottom: { style: 'thick', color: { rgb: 'CC5200' } },
          left: { style: 'thick', color: { rgb: 'CC5200' } },
          right: { style: 'thick', color: { rgb: 'CC5200' } },
        },
        alignment: { horizontal: 'center', vertical: 'center' },
      };
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Catálogo');
    XLSX.writeFile(wb, `${cotizacion.folio}-catalogo.xlsx`);
  }
}
