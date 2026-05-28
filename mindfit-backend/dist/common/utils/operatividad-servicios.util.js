"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESTADOS_OT_BLOQUEAN_OPERATIVIDAD_SERVICIOS = void 0;
exports.resolveCapacidadesSucursal = resolveCapacidadesSucursal;
exports.capacidadElemento = capacidadElemento;
exports.inferTiposFacilidadOt = inferTiposFacilidadOt;
exports.sumarElementosEnFalla = sumarElementosEnFalla;
exports.extraerElementosOt = extraerElementosOt;
exports.calcularEstadoFacilidadPorCapacidad = calcularEstadoFacilidadPorCapacidad;
exports.calcularSemaforoOperatividadExtendido = calcularSemaforoOperatividadExtendido;
exports.parseElementosAfectadosJson = parseElementosAfectadosJson;
exports.formatElementosFallaLabel = formatElementosFallaLabel;
exports.mergeCapacidadElementos = mergeCapacidadElementos;
const enums_1 = require("../enums");
const capacidades_servicios_types_1 = require("../types/capacidades-servicios.types");
const facilidades_criticas_util_1 = require("./facilidades-criticas.util");
exports.ESTADOS_OT_BLOQUEAN_OPERATIVIDAD_SERVICIOS = [
    enums_1.EstadoOrdenTrabajo.PENDIENTE,
    enums_1.EstadoOrdenTrabajo.ASIGNADA,
    enums_1.EstadoOrdenTrabajo.EN_PROCESO,
    enums_1.EstadoOrdenTrabajo.FINALIZADA,
];
function isTipoFacilidad(value) {
    return facilidades_criticas_util_1.DEFAULT_TIPOS_FACILIDAD.includes(value);
}
function isElementoAfectado(item) {
    return (item != null &&
        typeof item === 'object' &&
        'tipo_elemento' in item &&
        'cantidad' in item &&
        Number(item.cantidad) > 0);
}
function isServicioDetalle(item) {
    return (item != null &&
        typeof item === 'object' &&
        'tipoFacilidad' in item &&
        Array.isArray(item.elementos));
}
function resolveCapacidadesSucursal(raw) {
    const base = { ...capacidades_servicios_types_1.DEFAULT_CAPACIDADES_SERVICIOS };
    if (!raw)
        return base;
    for (const tipo of facilidades_criticas_util_1.DEFAULT_TIPOS_FACILIDAD) {
        base[tipo] = { ...base[tipo], ...raw[tipo] };
    }
    return base;
}
function capacidadElemento(capacidades, tipo, elemento) {
    const cap = capacidades[tipo]?.[elemento] ?? 0;
    return Math.max(0, Number(cap) || 0);
}
function inferTiposFacilidadOt(orden) {
    if (orden.clasificacion !== enums_1.ClasificacionOrden.INFRAESTRUCTURA) {
        return [];
    }
    if (orden.fallaGeneralServicios) {
        return [...facilidades_criticas_util_1.DEFAULT_TIPOS_FACILIDAD];
    }
    const raw = orden.serviciosAfectados;
    if (Array.isArray(raw) && raw.length) {
        if (typeof raw[0] === 'string' && isTipoFacilidad(raw[0])) {
            return raw.filter((t) => isTipoFacilidad(String(t)));
        }
        if (isServicioDetalle(raw[0])) {
            return raw.map((d) => d.tipoFacilidad);
        }
        if (isElementoAfectado(raw[0])) {
            const tipo = orden.facilidadCriticaTipo ??
                (orden.areaServicios && orden.generoServicios
                    ? (0, facilidades_criticas_util_1.resolveTipoFacilidad)(orden.areaServicios, orden.generoServicios)
                    : null);
            return tipo ? [tipo] : [];
        }
    }
    if (orden.facilidadCriticaTipo) {
        return [orden.facilidadCriticaTipo];
    }
    if (orden.areaServicios && orden.generoServicios) {
        return [
            (0, facilidades_criticas_util_1.resolveTipoFacilidad)(orden.areaServicios, orden.generoServicios),
        ];
    }
    return [];
}
function sumarElementosEnFalla(ots, tipoFacilidad, excluirOtId) {
    const suma = new Map();
    for (const el of capacidades_servicios_types_1.ELEMENTOS_POR_FACILIDAD[tipoFacilidad]) {
        suma.set(el, 0);
    }
    for (const ot of ots) {
        if (excluirOtId != null && ot.id === excluirOtId)
            continue;
        if (!exports.ESTADOS_OT_BLOQUEAN_OPERATIVIDAD_SERVICIOS.includes(ot.estado))
            continue;
        if (ot.clasificacion !== enums_1.ClasificacionOrden.INFRAESTRUCTURA)
            continue;
        const tipos = inferTiposFacilidadOt(ot);
        if (!tipos.includes(tipoFacilidad))
            continue;
        if (ot.fallaGeneralServicios) {
            for (const el of capacidades_servicios_types_1.ELEMENTOS_POR_FACILIDAD[tipoFacilidad]) {
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
function extraerElementosOt(ot, tipoFacilidad) {
    const raw = ot.serviciosAfectados;
    if (!Array.isArray(raw) || !raw.length)
        return [];
    if (isServicioDetalle(raw[0])) {
        const det = raw.find((d) => d.tipoFacilidad === tipoFacilidad);
        return det?.elementos ?? [];
    }
    if (isElementoAfectado(raw[0])) {
        const tipos = inferTiposFacilidadOt(ot);
        if (!tipos.includes(tipoFacilidad))
            return [];
        return raw;
    }
    return [];
}
function calcularEstadoFacilidadPorCapacidad(tipoFacilidad, capacidades, otsAbiertas, excluirOtId) {
    const ots = otsAbiertas.filter((ot) => exports.ESTADOS_OT_BLOQUEAN_OPERATIVIDAD_SERVICIOS.includes(ot.estado) &&
        ot.clasificacion === enums_1.ClasificacionOrden.INFRAESTRUCTURA &&
        inferTiposFacilidadOt(ot).includes(tipoFacilidad) &&
        (excluirOtId == null || ot.id !== excluirOtId));
    if (ots.some((ot) => ot.fallaGeneralServicios && inferTiposFacilidadOt(ot).includes(tipoFacilidad))) {
        return enums_1.EstadoFacilidadCritica.FUERA_DE_SERVICIO;
    }
    const enFalla = sumarElementosEnFalla(otsAbiertas, tipoFacilidad, excluirOtId);
    let hayParcial = false;
    let hayTotal = false;
    for (const elemento of capacidades_servicios_types_1.ELEMENTOS_POR_FACILIDAD[tipoFacilidad]) {
        const cap = capacidadElemento(capacidades, tipoFacilidad, elemento);
        const afectados = enFalla.get(elemento) ?? 0;
        if (cap <= 0 && afectados > 0) {
            hayTotal = true;
            continue;
        }
        if (afectados <= 0)
            continue;
        if (afectados >= cap) {
            hayTotal = true;
        }
        else {
            hayParcial = true;
        }
    }
    if (hayTotal)
        return enums_1.EstadoFacilidadCritica.FUERA_DE_SERVICIO;
    if (hayParcial)
        return enums_1.EstadoFacilidadCritica.DEGRADADO;
    return enums_1.EstadoFacilidadCritica.OPERATIVO;
}
function calcularSemaforoOperatividadExtendido(estados) {
    if (estados.some((e) => e === enums_1.EstadoFacilidadCritica.FUERA_DE_SERVICIO)) {
        return enums_1.SemaforoOperatividadSede.ROJO;
    }
    if (estados.some((e) => e === enums_1.EstadoFacilidadCritica.DEGRADADO ||
        e === enums_1.EstadoFacilidadCritica.MANTENIMIENTO)) {
        return enums_1.SemaforoOperatividadSede.AMARILLO;
    }
    return enums_1.SemaforoOperatividadSede.VERDE;
}
function parseElementosAfectadosJson(raw) {
    if (!raw?.trim())
        return [];
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed))
            return [];
        return parsed
            .filter((x) => x != null &&
            typeof x === 'object' &&
            typeof x.tipo_elemento === 'string' &&
            Number(x.cantidad) > 0)
            .map((x) => ({
            tipo_elemento: x.tipo_elemento,
            cantidad: Number(x.cantidad),
        }));
    }
    catch {
        return [];
    }
}
function formatElementosFallaLabel(elementos) {
    if (!elementos.length)
        return '';
    return elementos
        .map((e) => `${e.cantidad}x ${capacidades_servicios_types_1.LABEL_ELEMENTO_SERVICIO[e.tipo_elemento] ?? e.tipo_elemento}`)
        .join(', ');
}
function mergeCapacidadElementos(a, b) {
    return {
        wc: b.wc ?? a.wc,
        urinarios: b.urinarios ?? a.urinarios,
        lavamanos: b.lavamanos ?? a.lavamanos,
        duchas: b.duchas ?? a.duchas,
        lockers: b.lockers ?? a.lockers,
    };
}
//# sourceMappingURL=operatividad-servicios.util.js.map