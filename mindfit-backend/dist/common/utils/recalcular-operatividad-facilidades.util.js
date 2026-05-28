"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recalcularOperatividadFacilidades = recalcularOperatividadFacilidades;
exports.tiposParaRecalcularDesdeOt = tiposParaRecalcularDesdeOt;
const enums_1 = require("../enums");
const facilidad_critica_historial_entity_1 = require("../../entities/facilidad-critica-historial.entity");
const facilidad_critica_entity_1 = require("../../entities/facilidad-critica.entity");
const orden_trabajo_entity_1 = require("../../entities/orden-trabajo.entity");
const sucursal_entity_1 = require("../../entities/sucursal.entity");
const facilidades_criticas_util_1 = require("./facilidades-criticas.util");
const operatividad_servicios_util_1 = require("./operatividad-servicios.util");
async function recalcularOperatividadFacilidades(manager, sucursalId, opts = {}) {
    const sucursal = await manager.findOne(sucursal_entity_1.Sucursal, {
        where: { id: sucursalId },
        select: { id: true, capacidadesServicios: true },
    });
    if (!sucursal)
        return;
    const capacidades = (0, operatividad_servicios_util_1.resolveCapacidadesSucursal)(sucursal.capacidadesServicios);
    const tipos = opts.tipos?.length ? opts.tipos : [...facilidades_criticas_util_1.DEFAULT_TIPOS_FACILIDAD];
    const facilidades = await manager.getRepository(facilidad_critica_entity_1.FacilidadCritica).find({
        where: { sucursalId },
    });
    const otsRaw = await manager.getRepository(orden_trabajo_entity_1.OrdenTrabajo).find({
        where: {
            sucursalId,
            clasificacion: enums_1.ClasificacionOrden.INFRAESTRUCTURA,
        },
        relations: { facilidadCritica: true },
        select: {
            id: true,
            clasificacion: true,
            estado: true,
            sucursalId: true,
            fallaGeneralServicios: true,
            areaServicios: true,
            generoServicios: true,
            facilidadCriticaId: true,
            serviciosAfectados: true,
        },
    });
    const ots = otsRaw
        .filter((ot) => operatividad_servicios_util_1.ESTADOS_OT_BLOQUEAN_OPERATIVIDAD_SERVICIOS.includes(ot.estado))
        .map((ot) => ({
        id: ot.id,
        clasificacion: ot.clasificacion,
        estado: ot.estado,
        sucursalId: ot.sucursalId,
        fallaGeneralServicios: ot.fallaGeneralServicios,
        areaServicios: ot.areaServicios,
        generoServicios: ot.generoServicios,
        facilidadCriticaId: ot.facilidadCriticaId,
        serviciosAfectados: ot.serviciosAfectados,
        facilidadCriticaTipo: ot.facilidadCritica?.tipo ?? null,
    }));
    const historialRepo = manager.getRepository(facilidad_critica_historial_entity_1.FacilidadCriticaHistorial);
    const facilidadRepo = manager.getRepository(facilidad_critica_entity_1.FacilidadCritica);
    for (const tipo of tipos) {
        const facilidad = facilidades.find((f) => f.tipo === tipo);
        if (!facilidad)
            continue;
        const estadoNuevo = (0, operatividad_servicios_util_1.calcularEstadoFacilidadPorCapacidad)(tipo, capacidades, ots, opts.excluirOtId);
        if (facilidad.estado === estadoNuevo)
            continue;
        const estadoAnterior = facilidad.estado;
        facilidad.estado = estadoNuevo;
        if (opts.reportadoPorId != null) {
            facilidad.actualizadoPorId = opts.reportadoPorId;
        }
        await facilidadRepo.save(facilidad);
        await historialRepo.save({
            facilidadCriticaId: facilidad.id,
            estadoAnterior,
            estadoNuevo,
            descripcionProblema: opts.descripcionHistorial ??
                'Recálculo automático por operatividad de servicios',
            reportadoPorId: opts.reportadoPorId ?? null,
        });
    }
}
function tiposParaRecalcularDesdeOt(orden) {
    const tipos = (0, operatividad_servicios_util_1.inferTiposFacilidadOt)(orden);
    return tipos.length ? tipos : [...facilidades_criticas_util_1.DEFAULT_TIPOS_FACILIDAD];
}
//# sourceMappingURL=recalcular-operatividad-facilidades.util.js.map