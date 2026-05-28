"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LABEL_ELEMENTO_SERVICIO = exports.TIPO_ELEMENTO_SERVICIO_VALUES = exports.ELEMENTOS_POR_FACILIDAD = exports.DEFAULT_CAPACIDADES_SERVICIOS = void 0;
const enums_1 = require("../enums");
exports.DEFAULT_CAPACIDADES_SERVICIOS = {
    [enums_1.TipoFacilidadCritica.BANO_HOMBRES]: {
        wc: 4,
        urinarios: 3,
        lavamanos: 4,
    },
    [enums_1.TipoFacilidadCritica.BANO_MUJERES]: {
        wc: 4,
        urinarios: 3,
        lavamanos: 4,
    },
    [enums_1.TipoFacilidadCritica.CAMARIN_HOMBRES]: { lockers: 40 },
    [enums_1.TipoFacilidadCritica.CAMARIN_MUJERES]: { lockers: 40 },
    [enums_1.TipoFacilidadCritica.DUCHAS_HOMBRES]: { duchas: 6 },
    [enums_1.TipoFacilidadCritica.DUCHAS_MUJERES]: { duchas: 6 },
};
exports.ELEMENTOS_POR_FACILIDAD = {
    [enums_1.TipoFacilidadCritica.BANO_HOMBRES]: ['wc', 'urinarios', 'lavamanos'],
    [enums_1.TipoFacilidadCritica.BANO_MUJERES]: ['wc', 'urinarios', 'lavamanos'],
    [enums_1.TipoFacilidadCritica.CAMARIN_HOMBRES]: ['lockers'],
    [enums_1.TipoFacilidadCritica.CAMARIN_MUJERES]: ['lockers'],
    [enums_1.TipoFacilidadCritica.DUCHAS_HOMBRES]: ['duchas'],
    [enums_1.TipoFacilidadCritica.DUCHAS_MUJERES]: ['duchas'],
};
exports.TIPO_ELEMENTO_SERVICIO_VALUES = [
    'wc',
    'urinarios',
    'lavamanos',
    'duchas',
    'lockers',
];
exports.LABEL_ELEMENTO_SERVICIO = {
    wc: 'WC',
    urinarios: 'Urinarios',
    lavamanos: 'Lavamanos',
    duchas: 'Duchas',
    lockers: 'Lockers',
};
//# sourceMappingURL=capacidades-servicios.types.js.map