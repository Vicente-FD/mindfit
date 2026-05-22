import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, IsNull } from 'typeorm';
import { EstadoRendicionGasto } from '../common/enums/estado-rendicion-gasto.enum';
import { RolUsuario } from '../common/enums';
import { RendicionGasto } from '../entities/rendicion-gasto.entity';
import { Usuario } from '../entities/usuario.entity';
import { TransactionContextService } from '../common/database/transaction-context.service';
import { CreateRendicionGastoDto } from './dto/create-rendicion-gasto.dto';
import { DecidirRendicionGastoDto } from './dto/decidir-rendicion-gasto.dto';
import { FilterListaGastosDto } from './dto/filter-lista-gastos.dto';
import { buildBoletaPublicUrl } from './storage/boletas.storage';

export const LIMITE_MENSUAL_GASTO = 100_000;

export interface RendicionGastoDto {
  id: number;
  tecnicoId: number;
  tecnicoNombre: string;
  monto: number;
  descripcion: string;
  urlBoleta: string;
  estado: EstadoRendicionGasto;
  motivoRechazo: string | null;
  fechaGasto: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaldoTecnicoDto {
  tecnicoId: number;
  tecnicoNombre: string;
  tecnicoEmail: string;
  limiteMensual: number;
  montoAprobadoMes: number;
  saldoDisponible: number;
  porcentajeConsumido: number;
  alertaSaldoBajo: boolean;
}

export interface MiSaldoGastosDto {
  limiteMensual: number;
  montoAprobadoMes: number;
  saldoDisponible: number;
  historial: RendicionGastoDto[];
}

export interface AdminGastosDto {
  pendientes: RendicionGastoDto[];
  tecnicos: SaldoTecnicoDto[];
}

export interface GastosListaResumenDto {
  totalAprobado: number;
  totalPendiente: number;
  totalRechazado: number;
  totalGeneral: number;
  cantidad: number;
}

export interface ListaGastosDto {
  mes: string;
  desde: string;
  hasta: string;
  items: RendicionGastoDto[];
  resumen: GastosListaResumenDto;
}

@Injectable()
export class RendicionesGastosService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly transactionContext: TransactionContextService,
    private readonly configService: ConfigService,
  ) {}

  private repo() {
    return this.transactionContext.getRepository(
      RendicionGasto,
      this.dataSource,
    );
  }

  private usuarioRepo() {
    return this.transactionContext.getRepository(Usuario, this.dataSource);
  }

  private boundsForMes(mes?: string): { mes: string; desde: string; hasta: string } {
    let year: number;
    let monthIndex: number;

    if (mes && /^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) {
      const [y, m] = mes.split('-').map(Number);
      year = y;
      monthIndex = m - 1;
    } else {
      const now = new Date();
      year = now.getFullYear();
      monthIndex = now.getMonth();
    }

    const mesKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    const desde = `${mesKey}-01`;
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    const hasta = `${mesKey}-${String(lastDay).padStart(2, '0')}`;
    return { mes: mesKey, desde, hasta };
  }

  private monthBounds(): { desde: string; hasta: string } {
    const { desde, hasta } = this.boundsForMes();
    return { desde, hasta };
  }

  async findLista(
    filters: FilterListaGastosDto,
    options?: { tecnicoIdScope?: number },
  ): Promise<ListaGastosDto> {
    const { mes, desde, hasta } = this.boundsForMes(filters.mes);

    const qb = this.repo()
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.tecnico', 'tecnico')
      .where('g.fecha_gasto >= :desde', { desde })
      .andWhere('g.fecha_gasto <= :hasta', { hasta });

    const tecnicoFilter = options?.tecnicoIdScope ?? filters.tecnicoId;
    if (tecnicoFilter != null) {
      qb.andWhere('g.tecnico_id = :tecnicoId', { tecnicoId: tecnicoFilter });
    }

    if (filters.estado) {
      qb.andWhere('g.estado = :estado', { estado: filters.estado });
    }

    qb.orderBy('g.fecha_gasto', 'DESC').addOrderBy('g.created_at', 'DESC');

    const rows = await qb.getMany();
    const items = rows.map((g) => this.toDto(g));

    let totalAprobado = 0;
    let totalPendiente = 0;
    let totalRechazado = 0;

    for (const item of items) {
      const m = item.monto;
      if (item.estado === EstadoRendicionGasto.APROBADO) totalAprobado += m;
      else if (item.estado === EstadoRendicionGasto.PENDIENTE) totalPendiente += m;
      else if (item.estado === EstadoRendicionGasto.RECHAZADO) totalRechazado += m;
    }

    return {
      mes,
      desde,
      hasta,
      items,
      resumen: {
        totalAprobado,
        totalPendiente,
        totalRechazado,
        totalGeneral: totalAprobado + totalPendiente + totalRechazado,
        cantidad: items.length,
      },
    };
  }

  async sumAprobadosMes(tecnicoId: number, mes?: string): Promise<number> {
    const { desde, hasta } = this.boundsForMes(mes);
    const row = await this.repo()
      .createQueryBuilder('g')
      .select('COALESCE(SUM(g.monto), 0)', 'total')
      .where('g.tecnico_id = :tecnicoId', { tecnicoId })
      .andWhere('g.estado = :estado', { estado: EstadoRendicionGasto.APROBADO })
      .andWhere('g.fecha_gasto >= :desde', { desde })
      .andWhere('g.fecha_gasto <= :hasta', { hasta })
      .getRawOne<{ total: string }>();

    return Number(row?.total ?? 0);
  }

  async calcSaldoDisponible(tecnicoId: number): Promise<number> {
    const aprobado = await this.sumAprobadosMes(tecnicoId);
    return Math.max(0, LIMITE_MENSUAL_GASTO - aprobado);
  }

  async create(
    tecnicoId: number,
    dto: CreateRendicionGastoDto,
    boletaFilename: string,
  ): Promise<RendicionGastoDto> {
    const saldo = await this.calcSaldoDisponible(tecnicoId);
    if (saldo - dto.monto < 0) {
      throw new BadRequestException(
        'Has excedido tu límite de saldo mensual de 100.000 pesos',
      );
    }

    const port = this.configService.get<number>('PORT', 3000);
    const urlBoleta = buildBoletaPublicUrl(boletaFilename, port);
    const hoy = new Date().toISOString().slice(0, 10);

    const saved = await this.repo().save(
      this.repo().create({
        tecnicoId,
        monto: dto.monto,
        descripcion: dto.descripcion.trim(),
        urlBoleta,
        estado: EstadoRendicionGasto.PENDIENTE,
        motivoRechazo: null,
        fechaGasto: hoy,
      }),
    );

    const withTecnico = await this.repo().findOne({
      where: { id: saved.id },
      relations: { tecnico: true },
    });

    return this.toDto(withTecnico!);
  }

  async findMiSaldo(tecnicoId: number): Promise<MiSaldoGastosDto> {
    const montoAprobadoMes = await this.sumAprobadosMes(tecnicoId);
    const saldoDisponible = Math.max(0, LIMITE_MENSUAL_GASTO - montoAprobadoMes);

    const list = await this.repo().find({
      where: { tecnicoId },
      relations: { tecnico: true },
      order: { createdAt: 'DESC' },
    });

    return {
      limiteMensual: LIMITE_MENSUAL_GASTO,
      montoAprobadoMes,
      saldoDisponible,
      historial: list.map((g) => this.toDto(g)),
    };
  }

  async findAdminView(): Promise<AdminGastosDto> {
    const pendientes = await this.repo().find({
      where: { estado: EstadoRendicionGasto.PENDIENTE },
      relations: { tecnico: true },
      order: { createdAt: 'ASC' },
    });

    const tecnicos = await this.usuarioRepo().find({
      where: {
        rol: RolUsuario.TECNICO,
        estaActivo: true,
        deletedAt: IsNull(),
      },
      order: { nombre: 'ASC' },
      select: {
        id: true,
        nombre: true,
        email: true,
      },
    });

    const tecnicosResumen: SaldoTecnicoDto[] = [];
    for (const t of tecnicos) {
      tecnicosResumen.push(await this.buildSaldoTecnico(t));
    }

    return {
      pendientes: pendientes.map((g) => this.toDto(g)),
      tecnicos: tecnicosResumen,
    };
  }

  async decidir(
    id: number,
    dto: DecidirRendicionGastoDto,
  ): Promise<RendicionGastoDto> {
    const gasto = await this.repo().findOne({
      where: { id },
      relations: { tecnico: true },
    });

    if (!gasto) {
      throw new NotFoundException(`Rendición de gasto ${id} no encontrada`);
    }

    if (gasto.estado !== EstadoRendicionGasto.PENDIENTE) {
      throw new BadRequestException(
        'Solo se pueden decidir rendiciones en estado pendiente',
      );
    }

    if (dto.estado === EstadoRendicionGasto.RECHAZADO) {
      if (!dto.motivoRechazo?.trim()) {
        throw new BadRequestException(
          'Debe indicar el motivo de rechazo',
        );
      }
      gasto.estado = EstadoRendicionGasto.RECHAZADO;
      gasto.motivoRechazo = dto.motivoRechazo.trim();
    } else {
      const saldo = await this.calcSaldoDisponible(gasto.tecnicoId);
      if (gasto.monto > saldo) {
        throw new BadRequestException(
          `El técnico ya no tiene saldo suficiente para aprobar este gasto (disponible: $${Math.round(saldo).toLocaleString('es-CL')})`,
        );
      }
      gasto.estado = EstadoRendicionGasto.APROBADO;
      gasto.motivoRechazo = null;
    }

    const saved = await this.repo().save(gasto);
    return this.toDto(saved);
  }

  private async buildSaldoTecnico(
    usuario: Pick<Usuario, 'id' | 'nombre' | 'email'>,
  ): Promise<SaldoTecnicoDto> {
    const montoAprobadoMes = await this.sumAprobadosMes(usuario.id);
    const saldoDisponible = Math.max(0, LIMITE_MENSUAL_GASTO - montoAprobadoMes);
    const porcentajeConsumido =
      LIMITE_MENSUAL_GASTO > 0
        ? Math.min(100, (montoAprobadoMes / LIMITE_MENSUAL_GASTO) * 100)
        : 0;
    const alertaSaldoBajo =
      saldoDisponible < LIMITE_MENSUAL_GASTO * 0.15;

    return {
      tecnicoId: usuario.id,
      tecnicoNombre: usuario.nombre,
      tecnicoEmail: usuario.email,
      limiteMensual: LIMITE_MENSUAL_GASTO,
      montoAprobadoMes,
      saldoDisponible,
      porcentajeConsumido: Math.round(porcentajeConsumido * 10) / 10,
      alertaSaldoBajo,
    };
  }

  private toDto(gasto: RendicionGasto): RendicionGastoDto {
    return {
      id: gasto.id,
      tecnicoId: gasto.tecnicoId,
      tecnicoNombre: gasto.tecnico?.nombre ?? `Técnico #${gasto.tecnicoId}`,
      monto: Number(gasto.monto),
      descripcion: gasto.descripcion,
      urlBoleta: gasto.urlBoleta,
      estado: gasto.estado,
      motivoRechazo: gasto.motivoRechazo,
      fechaGasto:
        typeof gasto.fechaGasto === 'string'
          ? gasto.fechaGasto
          : String(gasto.fechaGasto).slice(0, 10),
      createdAt: gasto.createdAt,
      updatedAt: gasto.updatedAt,
    };
  }
}
