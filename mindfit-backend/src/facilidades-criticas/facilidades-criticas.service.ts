import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, IsNull } from 'typeorm';
import {
  EstadoFacilidadCritica,
  PrioridadOrden,
  RolUsuario,
  TipoFacilidadCritica,
} from '../common/enums';
import type { ElementoAfectadoDto } from '../common/types/capacidades-servicios.types';
import {
  type AreaFacilidad,
  calcularSemaforoOperatividad,
  DEFAULT_TIPOS_FACILIDAD,
  type GeneroFacilidad,
  labelAreaGenero,
  labelTipoFacilidad,
  resolveTipoFacilidad,
} from '../common/utils/facilidades-criticas.util';
import { parseElementosAfectadosJson } from '../common/utils/operatividad-servicios.util';
import { recalcularOperatividadFacilidades } from '../common/utils/recalcular-operatividad-facilidades.util';
import { TransactionContextService } from '../common/database/transaction-context.service';
import { OrdenesTrabajoService } from '../ordenes-trabajo/ordenes-trabajo.service';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { FacilidadCriticaHistorial } from '../entities/facilidad-critica-historial.entity';
import { FacilidadCritica } from '../entities/facilidad-critica.entity';
import { Sucursal } from '../entities/sucursal.entity';
import { ActualizarEstadoFacilidadDto } from './dto/actualizar-estado-facilidad.dto';
import {
  FacilidadCriticaItemDto,
  FacilidadHistorialItemDto,
  FacilidadesResumenDto,
  ReportarAreaServiciosResultDto,
  SedeSemaforoResumenDto,
} from './dto/facilidad-critica-response.dto';
import { ReportarAreaServiciosDto } from './dto/reportar-area-servicios.dto';
import { ReportarFallaFacilidadDto } from './dto/reportar-falla-facilidad.dto';

@Injectable()
export class FacilidadesCriticasService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly ordenesTrabajoService: OrdenesTrabajoService,
    private readonly transactionContext: TransactionContextService,
  ) {}

  private manager(): EntityManager {
    return this.transactionContext.getManager(this.dataSource);
  }

  async ensurePlantillaSucursal(
    sucursalId: number,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager
      ? manager.getRepository(FacilidadCritica)
      : this.dataSource.getRepository(FacilidadCritica);

    const existentes = await repo.find({
      where: { sucursalId },
      select: { id: true, tipo: true },
    });
    const tiposExistentes = new Set(existentes.map((f) => f.tipo));

    const faltantes = DEFAULT_TIPOS_FACILIDAD.filter(
      (t) => !tiposExistentes.has(t),
    );
    if (!faltantes.length) return;

    await repo.save(
      faltantes.map((tipo) =>
        repo.create({
          sucursalId,
          tipo,
          estado: EstadoFacilidadCritica.OPERATIVO,
        }),
      ),
    );
  }

  async backfillTodasLasSucursales(): Promise<void> {
    const sucursales = await this.dataSource.getRepository(Sucursal).find({
      where: { deletedAt: IsNull() },
      select: { id: true },
    });
    for (const s of sucursales) {
      await this.ensurePlantillaSucursal(s.id);
    }
  }

  async getResumenSucursal(sucursalId: number): Promise<FacilidadesResumenDto> {
    await this.ensurePlantillaSucursal(sucursalId);
    const items = await this.loadItemsConConteo(sucursalId);
    return this.buildResumen(items);
  }

  async getResumenGlobalSedes(): Promise<SedeSemaforoResumenDto[]> {
    const sucursales = await this.dataSource.getRepository(Sucursal).find({
      where: { deletedAt: IsNull(), estaActiva: true },
      order: { nombre: 'ASC' },
    });

    const result: SedeSemaforoResumenDto[] = [];
    for (const s of sucursales) {
      const resumen = await this.getResumenSucursal(s.id);
      result.push({
        sucursalId: s.id,
        sucursalNombre: s.nombre,
        sucursalSigla: s.sigla,
        semaforo: resumen.semaforo,
        operativas: resumen.operativas,
        degradadas: resumen.degradadas,
        enMantenimiento: resumen.enMantenimiento,
        fueraDeServicio: resumen.fueraDeServicio,
      });
    }
    return result;
  }

  async findMiSucursal(user: JwtPayload): Promise<FacilidadesResumenDto> {
    const sucursalId = await this.resolveSucursalIdUsuario(user);
    return this.getResumenSucursal(sucursalId);
  }

  async findBySucursalForUser(
    sucursalId: number,
    user: JwtPayload,
  ): Promise<FacilidadesResumenDto> {
    await this.assertPuedeVerSucursal(sucursalId, user);
    return this.getResumenSucursal(sucursalId);
  }

  async getHistorial(
    facilidadId: number,
    user: JwtPayload,
  ): Promise<FacilidadHistorialItemDto[]> {
    const facilidad = await this.findFacilidadOrFail(facilidadId);
    await this.assertPuedeVerSucursal(facilidad.sucursalId, user);

    const rows = await this.dataSource
      .getRepository(FacilidadCriticaHistorial)
      .find({
        where: { facilidadCriticaId: facilidadId },
        relations: { reportadoPor: true },
        order: { createdAt: 'DESC' },
        take: 50,
      });

    return rows.map((h) => ({
      id: h.id,
      estadoAnterior: h.estadoAnterior,
      estadoNuevo: h.estadoNuevo,
      descripcionProblema: h.descripcionProblema,
      reportadoPorNombre: h.reportadoPor?.nombre ?? null,
      createdAt: h.createdAt.toISOString(),
    }));
  }

  async reportarAreaServicios(
    dto: ReportarAreaServiciosDto,
    user: JwtPayload,
    fotoUrl: string,
  ): Promise<ReportarAreaServiciosResultDto> {
    const descripcion = dto.descripcionProblema.trim();
    if (!descripcion) {
      throw new BadRequestException('La descripción del problema es obligatoria');
    }
    if (!fotoUrl?.trim()) {
      throw new BadRequestException(
        'La fotografía del problema es obligatoria',
      );
    }

    const sucursalId = await this.resolveSucursalIdParaReporte(user);
    const esGeneral = ['true', '1'].includes(
      String(dto.esFallaGeneral ?? '').toLowerCase(),
    );

    if (!esGeneral && (!dto.area || !dto.genero)) {
      throw new BadRequestException(
        'Debe indicar el tipo de área y género, o marcar falla general',
      );
    }

    const prioridad = dto.prioridad ?? PrioridadOrden.MEDIA;
    const notas = dto.notasTecnicas?.trim() || null;

    const elementos = parseElementosAfectadosJson(dto.elementosAfectados);
    if (!esGeneral) {
      const totalElementos = elementos.reduce(
        (acc, e) => acc + (Number(e.cantidad) || 0),
        0,
      );
      if (totalElementos <= 0) {
        throw new BadRequestException(
          'Indique al menos un elemento dañado con cantidad mayor a cero',
        );
      }
    }

    const em = this.manager();
    await this.ensurePlantillaSucursal(sucursalId, em);

    let tituloOt: string;
    let facilidadCriticaId: number | null = null;

    if (esGeneral) {
      tituloOt = 'Falla general — área de servicios';
    } else {
      const tipo = resolveTipoFacilidad(
        dto.area as AreaFacilidad,
        dto.genero as GeneroFacilidad,
      );
      const facilidad = await em
        .getRepository(FacilidadCritica)
        .findOne({ where: { sucursalId, tipo } });
      if (!facilidad) {
        throw new NotFoundException(
          'No se encontró la facilidad indicada en esta sucursal',
        );
      }
      facilidadCriticaId = facilidad.id;
      tituloOt = `Área de servicios — ${labelAreaGenero(dto.area as AreaFacilidad, dto.genero as GeneroFacilidad)}`;
    }

    const prep = { tituloOt, facilidadCriticaId, esGeneral };

    const descripcionOt = notas
      ? `${descripcion}\n\nNotas: ${notas}`
      : descripcion;

    const orden = await this.ordenesTrabajoService.reportarFalla(
      {
        tipoReporte: 'infraestructura',
        descripcion: descripcionOt,
        prioridad,
        titulo: prep.tituloOt,
        facilidadCriticaId: prep.facilidadCriticaId ?? undefined,
        areaServicios: esGeneral ? undefined : dto.area,
        generoServicios: esGeneral ? undefined : dto.genero,
        fallaGeneralServicios: esGeneral ? 'true' : 'false',
        elementosAfectados: esGeneral ? undefined : elementos,
      },
      user.sub,
      sucursalId,
      fotoUrl,
    );

    return {
      ordenId: orden.id,
      codigoOt: orden.codigoOt,
      titulo: orden.titulo,
      facilidadCriticaId: prep.facilidadCriticaId,
      esFallaGeneral: prep.esGeneral,
    };
  }

  async reportarFalla(
    facilidadId: number,
    dto: ReportarFallaFacilidadDto,
    user: JwtPayload,
  ): Promise<FacilidadCriticaItemDto> {
    const descripcion = dto.descripcionProblema.trim();
    if (!descripcion) {
      throw new BadRequestException('La descripción del problema es obligatoria');
    }

    const manager = this.manager();
    const facilidad = await this.findFacilidadOrFail(facilidadId, manager);
    await this.assertPuedeModificarSucursal(facilidad.sucursalId, user);

    const estadoAnterior = facilidad.estado;
    const estadoNuevo = EstadoFacilidadCritica.FUERA_DE_SERVICIO;

    if (estadoAnterior === estadoNuevo && !dto.notasTecnicas?.trim()) {
      throw new BadRequestException(
        'La facilidad ya está fuera de servicio. Agregue notas si desea actualizar el registro.',
      );
    }

    facilidad.estado = estadoNuevo;
    if (dto.notasTecnicas?.trim()) {
      facilidad.notasTecnicas = dto.notasTecnicas.trim();
    }
    facilidad.actualizadoPorId = user.sub;
    await manager.getRepository(FacilidadCritica).save(facilidad);

    await manager.getRepository(FacilidadCriticaHistorial).save({
      facilidadCriticaId: facilidad.id,
      estadoAnterior,
      estadoNuevo,
      descripcionProblema: descripcion,
      reportadoPorId: user.sub,
    });

    return this.mapItem(
      facilidad,
      await this.countHistorialFallas(facilidad.id, manager),
    );
  }

  async actualizarEstado(
    facilidadId: number,
    dto: ActualizarEstadoFacilidadDto,
    user: JwtPayload,
  ): Promise<FacilidadCriticaItemDto> {
    this.assertPuedeResolverEstado(user);

    const manager = this.manager();
    const facilidad = await this.findFacilidadOrFail(facilidadId, manager);
    const estadoAnterior = facilidad.estado;
    const estadoNuevo = dto.estado;

    if (estadoAnterior === estadoNuevo && dto.notasTecnicas === undefined) {
      throw new BadRequestException('El estado ya es el indicado');
    }

    facilidad.estado = estadoNuevo;
    if (dto.notasTecnicas !== undefined) {
      facilidad.notasTecnicas = dto.notasTecnicas.trim() || null;
    }
    facilidad.actualizadoPorId = user.sub;
    await manager.getRepository(FacilidadCritica).save(facilidad);

    if (estadoAnterior !== estadoNuevo) {
      await manager.getRepository(FacilidadCriticaHistorial).save({
        facilidadCriticaId: facilidad.id,
        estadoAnterior,
        estadoNuevo,
        descripcionProblema:
          dto.notasTecnicas?.trim() ||
          `Estado actualizado a ${estadoNuevo} por operaciones`,
        reportadoPorId: user.sub,
      });
    }

    return this.mapItem(
      facilidad,
      await this.countHistorialFallas(facilidad.id, manager),
    );
  }

  private async loadItemsConConteo(
    sucursalId: number,
  ): Promise<FacilidadCriticaItemDto[]> {
    const facilidades = await this.dataSource.getRepository(FacilidadCritica).find({
      where: { sucursalId },
      order: { tipo: 'ASC' },
    });

    if (!facilidades.length) return [];

    const ids = facilidades.map((f) => f.id);
    const conteos = await this.dataSource
      .getRepository(FacilidadCriticaHistorial)
      .createQueryBuilder('h')
      .select('h.facilidad_critica_id', 'facilidadId')
      .addSelect('COUNT(*)::int', 'total')
      .where('h.facilidad_critica_id IN (:...ids)', { ids })
      .andWhere('h.estado_nuevo = :estado', {
        estado: EstadoFacilidadCritica.FUERA_DE_SERVICIO,
      })
      .groupBy('h.facilidad_critica_id')
      .getRawMany<{ facilidadId: string; total: number }>();

    const countMap = new Map(
      conteos.map((c) => [Number(c.facilidadId), Number(c.total)]),
    );

    return facilidades.map((f) =>
      this.mapItem(f, countMap.get(f.id) ?? 0),
    );
  }

  private buildResumen(items: FacilidadCriticaItemDto[]): FacilidadesResumenDto {
    const estados = items.map((i) => i.estado);
    return {
      semaforo: calcularSemaforoOperatividad(estados),
      operativas: items.filter(
        (i) => i.estado === EstadoFacilidadCritica.OPERATIVO,
      ).length,
      degradadas: items.filter(
        (i) => i.estado === EstadoFacilidadCritica.DEGRADADO,
      ).length,
      enMantenimiento: items.filter(
        (i) => i.estado === EstadoFacilidadCritica.MANTENIMIENTO,
      ).length,
      fueraDeServicio: items.filter(
        (i) => i.estado === EstadoFacilidadCritica.FUERA_DE_SERVICIO,
      ).length,
      items,
    };
  }

  private mapItem(
    f: FacilidadCritica,
    fallosHistoricos: number,
  ): FacilidadCriticaItemDto {
    return {
      id: f.id,
      sucursalId: f.sucursalId,
      tipo: f.tipo,
      tipoLabel: labelTipoFacilidad(f.tipo),
      estado: f.estado,
      notasTecnicas: f.notasTecnicas,
      updatedAt: f.updatedAt.toISOString(),
      fallosHistoricos,
    };
  }

  private async countHistorialFallas(
    facilidadId: number,
    manager?: EntityManager,
  ): Promise<number> {
    const repo = manager
      ? manager.getRepository(FacilidadCriticaHistorial)
      : this.dataSource.getRepository(FacilidadCriticaHistorial);
    return repo.count({
      where: {
        facilidadCriticaId: facilidadId,
        estadoNuevo: EstadoFacilidadCritica.FUERA_DE_SERVICIO,
      },
    });
  }

  private async findFacilidadOrFail(
    id: number,
    manager?: EntityManager,
  ): Promise<FacilidadCritica> {
    const repo = manager
      ? manager.getRepository(FacilidadCritica)
      : this.dataSource.getRepository(FacilidadCritica);
    const facilidad = await repo.findOne({ where: { id } });
    if (!facilidad) {
      throw new NotFoundException(`Facilidad crítica ${id} no encontrada`);
    }
    return facilidad;
  }

  private async aplicarFallaFacilidad(
    manager: EntityManager,
    facilidad: FacilidadCritica,
    descripcion: string,
    notas: string | null,
    userId: number,
  ): Promise<void> {
    const estadoAnterior = facilidad.estado;
    facilidad.estado = EstadoFacilidadCritica.FUERA_DE_SERVICIO;
    if (notas) facilidad.notasTecnicas = notas;
    facilidad.actualizadoPorId = userId;
    await manager.getRepository(FacilidadCritica).save(facilidad);
    await manager.getRepository(FacilidadCriticaHistorial).save({
      facilidadCriticaId: facilidad.id,
      estadoAnterior,
      estadoNuevo: EstadoFacilidadCritica.FUERA_DE_SERVICIO,
      descripcionProblema: descripcion,
      reportadoPorId: userId,
    });
  }

  private async marcarFallaEnTodasLasFacilidades(
    manager: EntityManager,
    sucursalId: number,
    descripcion: string,
    notas: string | null,
    userId: number,
  ): Promise<void> {
    const facilidades = await manager
      .getRepository(FacilidadCritica)
      .find({ where: { sucursalId } });
    for (const facilidad of facilidades) {
      await this.aplicarFallaFacilidad(
        manager,
        facilidad,
        descripcion,
        notas,
        userId,
      );
    }
  }

  private async resolveSucursalIdParaReporte(
    user: JwtPayload,
  ): Promise<number> {
    if (user.rol === RolUsuario.JEFE_SUCURSAL) {
      if (user.sucursalId == null) {
        throw new BadRequestException('Su usuario no tiene sucursal asignada');
      }
      return user.sucursalId;
    }
    if (
      user.rol === RolUsuario.ADMIN ||
      user.rol === RolUsuario.JEFE_OPERACIONES
    ) {
      throw new BadRequestException(
        'Use el panel de operaciones para reportar en otra sucursal',
      );
    }
    throw new ForbiddenException('Sin permisos para reportar área de servicios');
  }

  private async resolveSucursalIdUsuario(user: JwtPayload): Promise<number> {
    if (user.rol === RolUsuario.JEFE_SUCURSAL) {
      if (user.sucursalId == null) {
        throw new BadRequestException('Su usuario no tiene sucursal asignada');
      }
      return user.sucursalId;
    }
    throw new ForbiddenException('Solo aplica para jefe de sucursal');
  }

  private async assertPuedeVerSucursal(
    sucursalId: number,
    user: JwtPayload,
  ): Promise<void> {
    if (
      user.rol === RolUsuario.ADMIN ||
      user.rol === RolUsuario.JEFE_OPERACIONES ||
      user.rol === RolUsuario.GERENTE_BI
    ) {
      return;
    }
    if (user.rol === RolUsuario.JEFE_SUCURSAL) {
      if (user.sucursalId !== sucursalId) {
        throw new ForbiddenException(
          'No puede consultar facilidades de otra sucursal',
        );
      }
      return;
    }
    throw new ForbiddenException('Sin permisos para ver facilidades críticas');
  }

  private async assertPuedeModificarSucursal(
    sucursalId: number,
    user: JwtPayload,
  ): Promise<void> {
    if (
      user.rol === RolUsuario.ADMIN ||
      user.rol === RolUsuario.JEFE_OPERACIONES
    ) {
      return;
    }
    if (user.rol === RolUsuario.JEFE_SUCURSAL) {
      if (user.sucursalId !== sucursalId) {
        throw new ForbiddenException(
          'No puede reportar fallas en otra sucursal',
        );
      }
      return;
    }
    throw new ForbiddenException('Sin permisos para reportar fallas');
  }

  private assertPuedeResolverEstado(user: JwtPayload): void {
    if (
      user.rol === RolUsuario.ADMIN ||
      user.rol === RolUsuario.JEFE_OPERACIONES
    ) {
      return;
    }
    throw new ForbiddenException(
      'Solo operaciones o administración pueden cambiar el estado de resolución',
    );
  }
}
