import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activo } from '../entities/activo.entity';
import { OrdenTrabajo } from '../entities/orden-trabajo.entity';
import { Usuario } from '../entities/usuario.entity';
import {
  CategoriaActivo,
  EstadoOrdenTrabajo,
  RolUsuario,
} from '../common/enums';
import { AnalyticsFiltersDto } from './dto/analytics-filters.dto';

export interface KpisResponse {
  efectividadPe: number;
  otsReportadas: number;
  otsResueltas: number;
  gastoAcumuladoMantenimiento: number;
  mttrHoras: number;
  fallasPorCategoria: { categoria: string; total: number }[];
  otsPorSucursal: { sucursal: string; total: number }[];
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(OrdenTrabajo)
    private readonly ordenRepo: Repository<OrdenTrabajo>,
    @InjectRepository(Activo)
    private readonly activoRepo: Repository<Activo>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async getKpis(filters: AnalyticsFiltersDto): Promise<KpisResponse> {
    const qb = this.ordenRepo
      .createQueryBuilder('ot')
      .leftJoinAndSelect('ot.sucursal', 'sucursal')
      .leftJoinAndSelect('ot.activo', 'activo');

    if (filters.sucursalId) {
      qb.andWhere('ot.sucursal_id = :sucursalId', {
        sucursalId: filters.sucursalId,
      });
    }
    if (filters.tecnicoId) {
      qb.andWhere('ot.asignado_a_id = :tecnicoId', {
        tecnicoId: filters.tecnicoId,
      });
    }
    if (filters.categoria) {
      qb.andWhere('activo.categoria = :categoria', {
        categoria: filters.categoria,
      });
    }

    const ordenes = await qb.getMany();

    const otsReportadas = ordenes.length;
    const otsResueltas = ordenes.filter((o) =>
      [EstadoOrdenTrabajo.FINALIZADA, EstadoOrdenTrabajo.APROBADA].includes(
        o.estado,
      ),
    ).length;

    const efectividadPe =
      otsReportadas > 0
        ? Math.round((otsResueltas / otsReportadas) * 1000) / 10
        : 0;

    const cerradas = ordenes.filter(
      (o) =>
        o.fechaInicioReal &&
        o.fechaFinReal &&
        [EstadoOrdenTrabajo.FINALIZADA, EstadoOrdenTrabajo.APROBADA].includes(
          o.estado,
        ),
    );

    let mttrHoras = 0;
    if (cerradas.length > 0) {
      const totalMs = cerradas.reduce((acc, o) => {
        const start = new Date(o.fechaInicioReal!).getTime();
        const end = new Date(o.fechaFinReal!).getTime();
        return acc + Math.max(0, end - start);
      }, 0);
      mttrHoras = Math.round((totalMs / cerradas.length / 3600000) * 10) / 10;
    }

    const activoQb = this.activoRepo
      .createQueryBuilder('a')
      .leftJoin('a.sucursal', 'sucursal');

    if (filters.sucursalId) {
      activoQb.andWhere('a.sucursal_id = :sucursalId', {
        sucursalId: filters.sucursalId,
      });
    }
    if (filters.categoria) {
      activoQb.andWhere('a.categoria = :categoria', {
        categoria: filters.categoria,
      });
    }

    const activos = await activoQb.getMany();
    const gastoAcumuladoMantenimiento = activos.reduce((acc, a) => {
      const cost = a.costoAdquisicion ? parseFloat(a.costoAdquisicion) : 0;
      return acc + (Number.isFinite(cost) ? cost : 0);
    }, 0);

    const fallasMap = new Map<string, number>();
    for (const o of ordenes) {
      const cat = o.activo?.categoria ?? 'sin_categoria';
      fallasMap.set(cat, (fallasMap.get(cat) ?? 0) + 1);
    }

    const sucursalMap = new Map<string, number>();
    for (const o of ordenes) {
      const name = o.sucursal?.nombre ?? `Sede ${o.sucursalId}`;
      sucursalMap.set(name, (sucursalMap.get(name) ?? 0) + 1);
    }

    return {
      efectividadPe,
      otsReportadas,
      otsResueltas,
      gastoAcumuladoMantenimiento: Math.round(gastoAcumuladoMantenimiento),
      mttrHoras,
      fallasPorCategoria: Array.from(fallasMap.entries()).map(
        ([categoria, total]) => ({ categoria, total }),
      ),
      otsPorSucursal: Array.from(sucursalMap.entries()).map(
        ([sucursal, total]) => ({ sucursal, total }),
      ),
    };
  }

  async listTecnicos() {
    return this.usuarioRepo.find({
      where: { rol: RolUsuario.TECNICO, estaActivo: true },
      select: {
        id: true,
        nombre: true,
        email: true,
        sucursalId: true,
      },
      order: { nombre: 'ASC' },
    });
  }
}
