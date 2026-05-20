import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { WorkOrder } from '../models/work-order.model';
import { formatDateChile, formatDateTimeChile } from '../utils/date-format';

export interface OtReportMeta {
  fechaInicio: string;
  fechaFin: string;
  sucursalLabel: string;
}

export interface OtReportMetrics {
  reportadas: number;
  realizadas: number;
  pendientes: number;
  efectividadPe: number;
}

@Injectable({ providedIn: 'root' })
export class OtPdfReportService {
  computeMetrics(ordenes: WorkOrder[]): OtReportMetrics {
    const reportadas = ordenes.length;
    const realizadas = ordenes.filter((o) => o.estado === 'aprobada').length;
    const pendientes = ordenes.filter((o) =>
      ['pendiente', 'asignada', 'en_proceso', 'finalizada'].includes(o.estado),
    ).length;
    const efectividadPe =
      reportadas > 0 ? Math.round((realizadas / reportadas) * 1000) / 10 : 0;
    return { reportadas, realizadas, pendientes, efectividadPe };
  }

  async downloadPdf(ordenes: WorkOrder[], meta: OtReportMeta): Promise<void> {
    const metrics = this.computeMetrics(ordenes);
    const rows = ordenes
      .filter((o) => o.estado === 'aprobada')
      .sort(
        (a, b) =>
          new Date(b.fechaFinReal ?? b.createdAt).getTime() -
          new Date(a.fechaFinReal ?? a.createdAt).getTime(),
      );

    const el = document.createElement('div');
    el.setAttribute('id', 'mindfit-ot-report-print');
    el.style.cssText =
      'position:fixed;left:-10000px;top:0;width:794px;padding:32px;background:#ffffff;color:#111827;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.4';
    el.innerHTML = this.buildReportHtml(rows, meta, metrics);
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

      const fileDate = formatDateChile(new Date().toISOString());
      pdf.save(`Reporte_Mindfit_Ops_${fileDate}.pdf`);
    } finally {
      document.body.removeChild(el);
    }
  }

  private buildReportHtml(
    rows: WorkOrder[],
    meta: OtReportMeta,
    metrics: OtReportMetrics,
  ): string {
    const tableRows = rows.length
      ? rows
          .map((o) => {
            const tipo =
              o.clasificacion === 'infraestructura' ? 'Infraestructura' : 'Máquina';
            const activo = o.activo?.nombre ?? o.titulo ?? '—';
            const comentario = this.lastComentario(o);
            return `<tr>
              <td style="padding:6px 8px;border:1px solid #e5e7eb">${this.escape(o.codigoOt)}</td>
              <td style="padding:6px 8px;border:1px solid #e5e7eb">${tipo}</td>
              <td style="padding:6px 8px;border:1px solid #e5e7eb">${this.escape(activo)}</td>
              <td style="padding:6px 8px;border:1px solid #e5e7eb;text-transform:capitalize">${this.escape(o.prioridad)}</td>
              <td style="padding:6px 8px;border:1px solid #e5e7eb">${formatDateTimeChile(o.createdAt)}</td>
              <td style="padding:6px 8px;border:1px solid #e5e7eb">${formatDateTimeChile(o.fechaFinReal)}</td>
              <td style="padding:6px 8px;border:1px solid #e5e7eb">${this.escape(comentario)}</td>
            </tr>`;
          })
          .join('')
      : `<tr><td colspan="7" style="padding:12px;text-align:center;color:#6b7280;border:1px solid #e5e7eb">Sin órdenes finalizadas en el periodo seleccionado.</td></tr>`;

    return `
      <div style="border-bottom:3px solid #ff6600;padding-bottom:16px;margin-bottom:20px">
        <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827">Mindfit Ops</h1>
        <p style="margin:6px 0 0;font-size:14px;color:#4b5563">Reporte de Gestión de Mantenimiento</p>
      </div>
      <p style="margin:0 0 4px"><strong>Periodo:</strong> ${formatDateChile(meta.fechaInicio)} — ${formatDateChile(meta.fechaFin)}</p>
      <p style="margin:0 0 20px"><strong>Sucursal:</strong> ${this.escape(meta.sucursalLabel)}</p>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px">
        <div style="background:#f3f4f6;border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:11px;color:#6b7280;text-transform:uppercase">OTs reportadas</div>
          <div style="font-size:22px;font-weight:700">${metrics.reportadas}</div>
        </div>
        <div style="background:#ecfdf5;border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:11px;color:#6b7280;text-transform:uppercase">OTs realizadas</div>
          <div style="font-size:22px;font-weight:700;color:#059669">${metrics.realizadas}</div>
        </div>
        <div style="background:#fef3c7;border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:11px;color:#6b7280;text-transform:uppercase">OTs pendientes</div>
          <div style="font-size:22px;font-weight:700;color:#d97706">${metrics.pendientes}</div>
        </div>
        <div style="background:#fff7ed;border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:11px;color:#6b7280;text-transform:uppercase">Efectividad PE</div>
          <div style="font-size:22px;font-weight:700;color:#ea580c">${metrics.efectividadPe}%</div>
        </div>
      </div>
      <p style="margin:0 0 8px;font-size:11px;color:#6b7280">PE = (Realizadas / Reportadas) × 100</p>
      <table style="width:100%;border-collapse:collapse;font-size:11px">
        <thead>
          <tr style="background:#f9fafb">
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Caso</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Tipo</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Activo</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Prioridad</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Reportado</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Ejecutado</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Comentario técnico</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
      <p style="margin-top:20px;font-size:10px;color:#9ca3af">Generado el ${formatDateTimeChile(new Date().toISOString())} — Mindfit Ops</p>
    `;
  }

  private lastComentario(o: WorkOrder): string {
    const list = o.comentarios ?? [];
    if (!list.length) return '—';
    const sorted = [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return sorted[0]?.comentario ?? '—';
  }

  private escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
