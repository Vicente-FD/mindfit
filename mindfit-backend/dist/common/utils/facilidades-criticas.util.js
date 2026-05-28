"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TIPOS_FACILIDAD = void 0;
exports.labelTipoFacilidad = labelTipoFacilidad;
exports.resolveTipoFacilidad = resolveTipoFacilidad;
exports.labelAreaGenero = labelAreaGenero;
exports.calcularSemaforoOperatividad = calcularSemaforoOperatividad;
const enums_1 = require("../enums");
const TIPO_LABELS = {
    [enums_1.TipoFacilidadCritica.BANO_HOMBRES]: 'Baños hombres',
    [enums_1.TipoFacilidadCritica.BANO_MUJERES]: 'Baños mujeres',
    [enums_1.TipoFacilidadCritica.CAMARIN_HOMBRES]: 'Camarines hombres',
    [enums_1.TipoFacilidadCritica.CAMARIN_MUJERES]: 'Camarines mujeres',
    [enums_1.TipoFacilidadCritica.DUCHAS_HOMBRES]: 'Duchas hombres',
    [enums_1.TipoFacilidadCritica.DUCHAS_MUJERES]: 'Duchas mujeres',
};
exports.DEFAULT_TIPOS_FACILIDAD = [
    enums_1.TipoFacilidadCritica.BANO_HOMBRES,
    enums_1.TipoFacilidadCritica.BANO_MUJERES,
    enums_1.TipoFacilidadCritica.CAMARIN_HOMBRES,
    enums_1.TipoFacilidadCritica.CAMARIN_MUJERES,
    enums_1.TipoFacilidadCritica.DUCHAS_HOMBRES,
    enums_1.TipoFacilidadCritica.DUCHAS_MUJERES,
];
function labelTipoFacilidad(tipo) {
    return TIPO_LABELS[tipo] ?? tipo;
}
const AREA_GENERO_TO_TIPO = {
    bano: {
        hombres: enums_1.TipoFacilidadCritica.BANO_HOMBRES,
        mujeres: enums_1.TipoFacilidadCritica.BANO_MUJERES,
    },
    camarin: {
        hombres: enums_1.TipoFacilidadCritica.CAMARIN_HOMBRES,
        mujeres: enums_1.TipoFacilidadCritica.CAMARIN_MUJERES,
    },
    ducha: {
        hombres: enums_1.TipoFacilidadCritica.DUCHAS_HOMBRES,
        mujeres: enums_1.TipoFacilidadCritica.DUCHAS_MUJERES,
    },
};
function resolveTipoFacilidad(area, genero) {
    return AREA_GENERO_TO_TIPO[area][genero];
}
function labelAreaGenero(area, genero) {
    const areaLabel = area === 'bano' ? 'Baños' : area === 'camarin' ? 'Camarines' : 'Duchas';
    const generoLabel = genero === 'hombres' ? 'hombres' : 'mujeres';
    return `${areaLabel} ${generoLabel}`;
}
function calcularSemaforoOperatividad(estados) {
    if (estados.some((e) => e === enums_1.EstadoFacilidadCritica.FUERA_DE_SERVICIO)) {
        return enums_1.SemaforoOperatividadSede.ROJO;
    }
    if (estados.some((e) => e === enums_1.EstadoFacilidadCritica.DEGRADADO ||
        e === enums_1.EstadoFacilidadCritica.MANTENIMIENTO)) {
        return enums_1.SemaforoOperatividadSede.AMARILLO;
    }
    return enums_1.SemaforoOperatividadSede.VERDE;
}
//# sourceMappingURL=facilidades-criticas.util.js.map