import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  GastosListaResumen,
  LIMITE_MENSUAL_GASTO,
  RendicionGasto,
} from '../models/gastos.model';
import { formatDateChile, formatDateTimeChile } from '../utils/date-format';

export interface GastosPdfMeta {
  mes: string;
  mesLabel: string;
  tecnicoLabel: string;
}

@Injectable({ providedIn: 'root' })
export class GastosPdfReportService {
  async downloadPdf(
    items: RendicionGasto[],
    resumen: GastosListaResumen,
    meta: GastosPdfMeta,
  ): Promise<void> {
    const el = document.createElement('div');
    el.setAttribute('id', 'mindfit-gastos-report-print');
    el.style.cssText =
      'position:fixed;left:-10000px;top:0;width:794px;padding:32px;background:#ffffff;color:#111827;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.4';
    el.innerHTML = this.buildReportHtml(items, resumen, meta);
    document.body.appendChild(el);

    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const printableWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * printableWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, printableWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, printableWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      const mesFile = meta.mes.replace('-', '_');
      pdf.save(`Rendicion_Gastos_Mindfit_${mesFile}.pdf`);
    } finally {
      document.body.removeChild(el);
    }
  }

  mesLabelFromKey(mes: string): string {
    const [y, m] = mes.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    return d.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  }

  private buildReportHtml(
    items: RendicionGasto[],
    resumen: GastosListaResumen,
    meta: GastosPdfMeta,
  ): string {
    const tableRows = items.length
      ? items
          .map((g) => {
            return `<tr>
              <td style="padding:6px 8px;border:1px solid #e5e7eb">${formatDateChile(g.fechaGasto)}</td>
              <td style="padding:6px 8px;border:1px solid #e5e7eb">${this.escape(g.tecnicoNombre)}</td>
              <td style="padding:6px 8px;border:1px solid #e5e7eb">${this.escape(g.descripcion)}</td>
              <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:right">${this.formatClp(g.monto)}</td>
              <td style="padding:6px 8px;border:1px solid #e5e7eb">${this.estadoLabel(g.estado)}</td>
              <td style="padding:6px 8px;border:1px solid #e5e7eb;font-size:10px">${g.motivoRechazo ? this.escape(g.motivoRechazo) : '—'}</td>
            </tr>`;
          })
          .join('')
      : `<tr><td colspan="6" style="padding:12px;text-align:center;color:#6b7280;border:1px solid #e5e7eb">Sin rendiciones en el periodo seleccionado.</td></tr>`;

    return `
      <div style="border-bottom:3px solid #ff6600;padding-bottom:16px;margin-bottom:20px">
        <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827">Mindfit Ops</h1>
        <p style="margin:6px 0 0;font-size:14px;color:#4b5563">Rendición de Gastos — Caja Chica Técnicos</p>
      </div>
      <p style="margin:0 0 4px"><strong>Periodo:</strong> ${this.escape(meta.mesLabel)}</p>
      <p style="margin:0 0 4px"><strong>Ámbito:</strong> ${this.escape(meta.tecnicoLabel)}</p>
      <p style="margin:0 0 20px"><strong>Límite mensual por técnico:</strong> ${this.formatClp(LIMITE_MENSUAL_GASTO)}</p>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px">
        <div style="background:#ecfdf5;border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:11px;color:#6b7280;text-transform:uppercase">Aprobado</div>
          <div style="font-size:18px;font-weight:700;color:#059669">${this.formatClp(resumen.totalAprobado)}</div>
        </div>
        <div style="background:#fef3c7;border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:11px;color:#6b7280;text-transform:uppercase">Pendiente</div>
          <div style="font-size:18px;font-weight:700;color:#d97706">${this.formatClp(resumen.totalPendiente)}</div>
        </div>
        <div style="background:#fef2f2;border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:11px;color:#6b7280;text-transform:uppercase">Rechazado</div>
          <div style="font-size:18px;font-weight:700;color:#dc2626">${this.formatClp(resumen.totalRechazado)}</div>
        </div>
        <div style="background:#f3f4f6;border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:11px;color:#6b7280;text-transform:uppercase">Registros</div>
          <div style="font-size:22px;font-weight:700">${resumen.cantidad}</div>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:11px">
        <thead>
          <tr style="background:#f9fafb">
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Fecha</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Técnico</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Descripción</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:right">Monto</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Estado</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Motivo rechazo</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
      <p style="margin-top:20px;font-size:10px;color:#9ca3af">Generado el ${formatDateTimeChile(new Date().toISOString())} — Mindfit Ops</p>
    `;
  }

  private estadoLabel(estado: RendicionGasto['estado']): string {
    const map: Record<RendicionGasto['estado'], string> = {
      pendiente: 'Pendiente',
      aprobado: 'Aprobado',
      rechazado: 'Rechazado',
    };
    return map[estado] ?? estado;
  }

  private formatClp(value: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  private escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
