import {
  ClasificacionOrden,
  EstadoFacilidadCritica,
  EstadoOrdenTrabajo,
  SemaforoOperatividadSede,
  TipoFacilidadCritica,
} from '../enums';
import {
  CapacidadElementos,
  CapacidadesServicios,
  DEFAULT_CAPACIDADES_SERVICIOS,
  ElementoAfectadoDto,
  ELEMENTOS_POR_FACILIDAD,
  LABEL_ELEMENTO_SERVICIO,
  ServicioAfectadoDetalleDto,
  ServiciosAfectadosPayload,
  TipoElementoServicio,
} from '../types/capacidades-servicios.types';
import {
  DEFAULT_TIPOS_FACILIDAD,
  resolveTipoFacilidad,
  type AreaFacilidad,
  type GeneroFacilidad,
} from './facilidades-criticas.util';

export const ESTADOS_OT_BLOQUEAN_OPERATIVIDAD_SERVICIOS: EstadoOrdenTrabajo[] = [
  EstadoOrdenTrabajo.PENDIENTE,
  EstadoOrdenTrabajo.ASIGNADA,
  EstadoOrdenTrabajo.EN_PROCESO,
  EstadoOrdenTrabajo.FINALIZADA,
];

export interface OtServiciosContext {
  id: number;
  clasificacion: ClasificacionOrden;
  estado: EstadoOrdenTrabajo;
  sucursalId: number;
  fallaGeneralServicios: boolean;
  areaServicios: 'bano' | 'camarin' | 'ducha' | null;
  generoServicios: 'hombres' | 'mujeres' | null;
  facilidadCriticaId?: number | null;
  serviciosAfectados?: ServiciosAfectadosPayload | null;
  facilidadCriticaTipo?: TipoFacilidadCritica | null;
}

function isTipoFacilidad(value: string): value is TipoFacilidadCritica {
  return (DEFAULT_TIPOS_FACILIDAD as string[]).includes(value);
}

function isElementoAfectado(item: unknown): item is ElementoAfectadoDto {
  return (
    item != null &&
    typeof item === 'object' &&
    'tipo_elemento' in item &&
    'cantidad' in item &&
    Number((item as ElementoAfectadoDto).cantidad) > 0
  );
}

function isServicioDetalle(item: unknown): item is ServicioAfectadoDetalleDto {
  return (
    item != null &&
    typeof item === 'object' &&
    'tipoFacilidad' in item &&
    Array.isArray((item as ServicioAfectadoDetalleDto).elementos)
  );
}

export function resolveCapacidadesSucursal(
  raw: CapacidadesServicios | null | undefined,
): CapacidadesServicios {
  const base = { ...DEFAULT_CAPACIDADES_SERVICIOS };
  if (!raw) return base;
  for (const tipo of DEFAULT_TIPOS_FACILIDAD) {
    base[tipo] = { ...base[tipo], ...raw[tipo] };
  }
  return base;
}

export function capacidadElemento(
  capacidades: CapacidadesServicios,
  tipo: TipoFacilidadCritica,
  elemento: TipoElementoServicio,
): number {
  const cap = capacidades[tipo]?.[elemento] ?? 0;
  return Math.max(0, Number(cap) || 0);
}

/** Tipos de facilidad impactados por una OT de servicios. */
export function inferTiposFacilidadOt(orden: OtServiciosContext): TipoFacilidadCritica[] {
  if (orden.clasificacion !== ClasificacionOrden.INFRAESTRUCTURA) {
    return [];
  }
  if (orden.fallaGeneralServicios) {
    return [...DEFAULT_TIPOS_FACILIDAD];
  }

  const raw = orden.serviciosAfectados;
  if (Array.isArray(raw) && raw.length) {
    if (typeof raw[0] === 'string' && isTipoFacilidad(raw[0])) {
      return raw.filter((t): t is TipoFacilidadCritica => isTipoFacilidad(String(t)));
    }
    if (isServicioDetalle(raw[0])) {
      return (raw as ServicioAfectadoDetalleDto[]).map((d) => d.tipoFacilidad);
    }
    if (isElementoAfectado(raw[0])) {
      const tipo =
        orden.facilidadCriticaTipo ??
        (orden.areaServicios && orden.generoServicios
          ? resolveTipoFacilidad(
              orden.areaServicios as AreaFacilidad,
              orden.generoServicios as GeneroFacilidad,
            )
          : null);
      return tipo ? [tipo] : [];
    }
  }

  if (orden.facilidadCriticaTipo) {
    return [orden.facilidadCriticaTipo];
  }
  if (orden.areaServicios && orden.generoServicios) {
    return [
      resolveTipoFacilidad(
        orden.areaServicios as AreaFacilidad,
        orden.generoServicios as GeneroFacilidad,
      ),
    ];
  }
  return [];
}

/** Suma elementos en falla de OTs abiertas para una facilidad. */
export function sumarElementosEnFalla(
  ots: OtServiciosContext[],
  tipoFacilidad: TipoFacilidadCritica,
  excluirOtId?: number,
): Map<TipoElementoServicio, number> {
  const suma = new Map<TipoElementoServicio, number>();
  for (const el of ELEMENTOS_POR_FACILIDAD[tipoFacilidad]) {
    suma.set(el, 0);
  }

  for (const ot of ots) {
    if (excluirOtId != null && ot.id === excluirOtId) continue;
    if (!ESTADOS_OT_BLOQUEAN_OPERATIVIDAD_SERVICIOS.includes(ot.estado)) continue;
    if (ot.clasificacion !== ClasificacionOrden.INFRAESTRUCTURA) continue;

    const tipos = inferTiposFacilidadOt(ot);
    if (!tipos.includes(tipoFacilidad)) continue;

    if (ot.fallaGeneralServicios) {
      for (const el of ELEMENTOS_POR_FACILIDAD[tipoFacilidad]) {
        const capKey = el;
        suma.set(el, Number.MAX_SAFE_INTEGER);
      }
      continue;
    }

    const elementos = extraerElementosOt(ot, tipoFacilidad);
    for (const { tipo_elemento, cantidad } of elementos) {
      const prev = suma.get(tipo_elemento) ?? 0;
      suma.set(tipo_elemento, prev + Math.max(0, Number(cantidad) || 0));
    }
  }

  return suma;
}

export function extraerElementosOt(
  ot: OtServiciosContext,
  tipoFacilidad: TipoFacilidadCritica,
): ElementoAfectadoDto[] {
  const raw = ot.serviciosAfectados;
  if (!Array.isArray(raw) || !raw.length) return [];

  if (isServicioDetalle(raw[0])) {
    const det = (raw as ServicioAfectadoDetalleDto[]).find(
      (d) => d.tipoFacilidad === tipoFacilidad,
    );
    return det?.elementos ?? [];
  }

  if (isElementoAfectado(raw[0])) {
    const tipos = inferTiposFacilidadOt(ot);
    if (!tipos.includes(tipoFacilidad)) return [];
    return raw as ElementoAfectadoDto[];
  }

  return [];
}

export function calcularEstadoFacilidadPorCapacidad(
  tipoFacilidad: TipoFacilidadCritica,
  capacidades: CapacidadesServicios,
  otsAbiertas: OtServiciosContext[],
  excluirOtId?: number,
): EstadoFacilidadCritica {
  const ots = otsAbiertas.filter(
    (ot) =>
      ESTADOS_OT_BLOQUEAN_OPERATIVIDAD_SERVICIOS.includes(ot.estado) &&
      ot.clasificacion === ClasificacionOrden.INFRAESTRUCTURA &&
      inferTiposFacilidadOt(ot).includes(tipoFacilidad) &&
      (excluirOtId == null || ot.id !== excluirOtId),
  );

  if (
    ots.some(
      (ot) =>
        ot.fallaGeneralServicios && inferTiposFacilidadOt(ot).includes(tipoFacilidad),
    )
  ) {
    return EstadoFacilidadCritica.FUERA_DE_SERVICIO;
  }

  const enFalla = sumarElementosEnFalla(otsAbiertas, tipoFacilidad, excluirOtId);
  let hayParcial = false;
  let hayTotal = false;

  for (const elemento of ELEMENTOS_POR_FACILIDAD[tipoFacilidad]) {
    const cap = capacidadElemento(capacidades, tipoFacilidad, elemento);
    const afectados = enFalla.get(elemento) ?? 0;
    if (cap <= 0 && afectados > 0) {
      hayTotal = true;
      continue;
    }
    if (afectados <= 0) continue;
    if (afectados >= cap) {
      hayTotal = true;
    } else {
      hayParcial = true;
    }
  }

  if (hayTotal) return EstadoFacilidadCritica.FUERA_DE_SERVICIO;
  if (hayParcial) return EstadoFacilidadCritica.DEGRADADO;
  return EstadoFacilidadCritica.OPERATIVO;
}

export function calcularSemaforoOperatividadExtendido(
  estados: EstadoFacilidadCritica[],
): SemaforoOperatividadSede {
  if (estados.some((e) => e === EstadoFacilidadCritica.FUERA_DE_SERVICIO)) {
    return SemaforoOperatividadSede.ROJO;
  }
  if (
    estados.some(
      (e) =>
        e === EstadoFacilidadCritica.DEGRADADO ||
        e === EstadoFacilidadCritica.MANTENIMIENTO,
    )
  ) {
    return SemaforoOperatividadSede.AMARILLO;
  }
  return SemaforoOperatividadSede.VERDE;
}

export function parseElementosAfectadosJson(
  raw?: string,
): ElementoAfectadoDto[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is ElementoAfectadoDto =>
          x != null &&
          typeof x === 'object' &&
          typeof (x as ElementoAfectadoDto).tipo_elemento === 'string' &&
          Number((x as ElementoAfectadoDto).cantidad) > 0,
      )
      .map((x) => ({
        tipo_elemento: (x as ElementoAfectadoDto).tipo_elemento,
        cantidad: Number((x as ElementoAfectadoDto).cantidad),
      }));
  } catch {
    return [];
  }
}

export function formatElementosFallaLabel(
  elementos: ElementoAfectadoDto[],
): string {
  if (!elementos.length) return '';
  return elementos
    .map(
      (e) =>
        `${e.cantidad}x ${LABEL_ELEMENTO_SERVICIO[e.tipo_elemento] ?? e.tipo_elemento}`,
    )
    .join(', ');
}

export function mergeCapacidadElementos(
  a: CapacidadElementos,
  b: CapacidadElementos,
): CapacidadElementos {
  return {
    wc: b.wc ?? a.wc,
    urinarios: b.urinarios ?? a.urinarios,
    lavamanos: b.lavamanos ?? a.lavamanos,
    duchas: b.duchas ?? a.duchas,
    lockers: b.lockers ?? a.lockers,
  };
}
