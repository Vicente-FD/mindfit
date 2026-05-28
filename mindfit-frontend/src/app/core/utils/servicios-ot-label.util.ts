import type { WorkOrder } from '../models/work-order.model';
import {
  formatElementosLabel,
  type ElementoAfectado,
  LABEL_ELEMENTO,
} from './capacidades-servicios.util';

function isElementoAfectado(x: unknown): x is ElementoAfectado {
  return (
    x != null &&
    typeof x === 'object' &&
    'tipo_elemento' in x &&
    'cantidad' in x
  );
}

export function parseElementosFromOt(orden: WorkOrder): ElementoAfectado[] {
  const raw = orden.serviciosAfectados;
  if (!Array.isArray(raw) || !raw.length) return [];
  if (isElementoAfectado(raw[0])) {
    return raw as ElementoAfectado[];
  }
  return [];
}

export function labelReporteServiciosOt(orden: WorkOrder): string | null {
  if (orden.clasificacion !== 'infraestructura') return null;
  const esServicios =
    orden.fallaGeneralServicios === true ||
    !!orden.areaServicios ||
    parseElementosFromOt(orden).length > 0;
  if (!esServicios) return null;

  if (orden.fallaGeneralServicios) {
    return 'Falla general en área de servicios';
  }

  const elementos = parseElementosFromOt(orden);
  if (elementos.length) {
    const areaLabel = areaServiciosLabel(orden.areaServicios);
    const generoLabel =
      orden.generoServicios === 'mujeres' ? 'Mujeres' : 'Hombres';
    return `Falla específica: ${formatElementosLabel(elementos)} en ${areaLabel} ${generoLabel}`;
  }

  return areaServiciosLabelCompleto(orden);
}

function areaServiciosLabel(
  area?: 'bano' | 'camarin' | 'ducha' | null,
): string {
  const map = { bano: 'Baños', camarin: 'Camarines', ducha: 'Duchas' };
  return area ? map[area] : 'Área de servicios';
}

function areaServiciosLabelCompleto(orden: WorkOrder): string {
  const area = areaServiciosLabel(orden.areaServicios);
  const genero =
    orden.generoServicios === 'mujeres' ? 'Mujeres' : 'Hombres';
  return `${area} · ${genero}`;
}

export { LABEL_ELEMENTO };
