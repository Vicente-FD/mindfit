import { EntityManager } from 'typeorm';
import { ClasificacionOrden, TipoFacilidadCritica } from '../enums';
import { FacilidadCriticaHistorial } from '../../entities/facilidad-critica-historial.entity';
import { FacilidadCritica } from '../../entities/facilidad-critica.entity';
import { OrdenTrabajo } from '../../entities/orden-trabajo.entity';
import { Sucursal } from '../../entities/sucursal.entity';
import { DEFAULT_TIPOS_FACILIDAD } from './facilidades-criticas.util';
import {
  calcularEstadoFacilidadPorCapacidad,
  ESTADOS_OT_BLOQUEAN_OPERATIVIDAD_SERVICIOS,
  inferTiposFacilidadOt,
  OtServiciosContext,
  resolveCapacidadesSucursal,
} from './operatividad-servicios.util';

export interface RecalcularOperatividadOpts {
  tipos?: TipoFacilidadCritica[];
  excluirOtId?: number;
  reportadoPorId?: number;
  descripcionHistorial?: string;
}

export async function recalcularOperatividadFacilidades(
  manager: EntityManager,
  sucursalId: number,
  opts: RecalcularOperatividadOpts = {},
): Promise<void> {
  const sucursal = await manager.findOne(Sucursal, {
    where: { id: sucursalId },
    select: { id: true, capacidadesServicios: true },
  });
  if (!sucursal) return;

  const capacidades = resolveCapacidadesSucursal(sucursal.capacidadesServicios);
  const tipos = opts.tipos?.length ? opts.tipos : [...DEFAULT_TIPOS_FACILIDAD];

  const facilidades = await manager.getRepository(FacilidadCritica).find({
    where: { sucursalId },
  });

  const otsRaw = await manager.getRepository(OrdenTrabajo).find({
    where: {
      sucursalId,
      clasificacion: ClasificacionOrden.INFRAESTRUCTURA,
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

  const ots: OtServiciosContext[] = otsRaw
    .filter((ot) => ESTADOS_OT_BLOQUEAN_OPERATIVIDAD_SERVICIOS.includes(ot.estado))
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

  const historialRepo = manager.getRepository(FacilidadCriticaHistorial);
  const facilidadRepo = manager.getRepository(FacilidadCritica);

  for (const tipo of tipos) {
    const facilidad = facilidades.find((f) => f.tipo === tipo);
    if (!facilidad) continue;

    const estadoNuevo = calcularEstadoFacilidadPorCapacidad(
      tipo,
      capacidades,
      ots,
      opts.excluirOtId,
    );

    if (facilidad.estado === estadoNuevo) continue;

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
      descripcionProblema:
        opts.descripcionHistorial ??
        'Recálculo automático por operatividad de servicios',
      reportadoPorId: opts.reportadoPorId ?? null,
    });
  }
}

/** Tipos de facilidad a recalcular tras cambio en una OT. */
export function tiposParaRecalcularDesdeOt(
  orden: OtServiciosContext,
): TipoFacilidadCritica[] {
  const tipos = inferTiposFacilidadOt(orden);
  return tipos.length ? tipos : [...DEFAULT_TIPOS_FACILIDAD];
}
