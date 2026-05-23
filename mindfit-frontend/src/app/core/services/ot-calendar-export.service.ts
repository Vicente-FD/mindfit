import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { WorkOrder } from '../models/work-order.model';
import { formatDateChile } from '../utils/date-format';
import {
  activoResumenOt,
  calcDiasTotalesTrabajo,
  ESTADO_OT_LABEL,
  mesLabelFromKey,
  PRIORIDAD_OT_LABEL,
  tecnicoResumenOt,
  todayDateKey,
} from '../utils/ot-day-label.util';

@Injectable({ providedIn: 'root' })
export class OtCalendarExportService {
  async exportPdf(calendarElement: HTMLElement, mes: string): Promise<void> {
    calendarElement.classList.add('calendar-export-mode');

    const noPrintEls = calendarElement.querySelectorAll<HTMLElement>(
      '.calendar-no-print',
    );
    const originalDisplay = new Map<HTMLElement, string>();
    noPrintEls.forEach((el) => {
      originalDisplay.set(el, el.style.display);
      el.style.display = 'none';
    });

    const prevBg = calendarElement.style.backgroundColor;
    const prevColor = calendarElement.style.color;
    calendarElement.style.backgroundColor = '#ffffff';
    calendarElement.style.color = '#111827';

    try {
      const canvas = await html2canvas(calendarElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const printableWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * printableWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, printableWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage('a4', 'l');
        pdf.addImage(imgData, 'PNG', margin, position, printableWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      pdf.save(`Calendario_Mantenimiento_Mindfit_Ops_${mes}.pdf`);
    } finally {
      calendarElement.classList.remove('calendar-export-mode');
      calendarElement.style.backgroundColor = prevBg;
      calendarElement.style.color = prevColor;
      noPrintEls.forEach((el) => {
        el.style.display = originalDisplay.get(el) ?? '';
      });
    }
  }

  exportPlanilla(ordenes: WorkOrder[], mes: string): void {
    const todayKey = todayDateKey();
    const headers = [
      'Código Caso',
      'Título',
      'Sucursal',
      'Activo/Infraestructura',
      'Prioridad',
      'Técnico Asignado',
      'Fecha Reporte',
      'Fecha Inicio Real',
      'Fecha Fin Real',
      'Días Totales de Downtime/Trabajo',
      'Estado Final',
    ];

    const rows = ordenes.map((ot) => [
      ot.codigoOt,
      ot.titulo,
      ot.sucursal?.nombre ?? '—',
      activoResumenOt(ot),
      PRIORIDAD_OT_LABEL[ot.prioridad] ?? ot.prioridad,
      tecnicoResumenOt(ot),
      formatDateChile(ot.createdAt),
      formatDateChile(ot.fechaInicioReal),
      formatDateChile(ot.fechaFinReal),
      String(calcDiasTotalesTrabajo(ot, todayKey)),
      ESTADO_OT_LABEL[ot.estado] ?? ot.estado,
    ]);

    const escape = (value: string): string => {
      const v = value.replace(/"/g, '""');
      return `"${v}"`;
    };

    const csvBody = [headers, ...rows]
      .map((row) => row.map((cell) => escape(String(cell))).join(';'))
      .join('\r\n');

    const blob = new Blob(['\uFEFF' + csvBody], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `Planilla_OTs_Mindfit_Ops_${mes}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  mesLabel(mes: string): string {
    return mesLabelFromKey(mes);
  }
}
