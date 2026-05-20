import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Activo } from '../entities/activo.entity';
import { Marca } from '../entities/marca.entity';
import { TransactionContextService } from '../common/database/transaction-context.service';
import { CodigoInventarioService } from './codigo-inventario.service';
import { CreateActivoDto } from './dto/create-activo.dto';
import { FilterActivosDto } from './dto/filter-activos.dto';
import { UpdateActivoDto } from './dto/update-activo.dto';

@Injectable()
export class ActivosService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly transactionContext: TransactionContextService,
    private readonly codigoInventario: CodigoInventarioService,
  ) {}

  private repo() {
    return this.transactionContext.getRepository(Activo, this.dataSource);
  }

  findAll(filters: FilterActivosDto = {}) {
    const qb = this.repo()
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.sucursal', 'sucursal')
      .leftJoinAndSelect('a.marcaRelacion', 'marca')
      .orderBy('a.nombre', 'ASC');

    if (filters.sucursalId != null) {
      qb.andWhere('a.sucursal_id = :sucursalId', {
        sucursalId: filters.sucursalId,
      });
    }
    if (filters.marcaId != null) {
      qb.andWhere('a.marca_id = :marcaId', { marcaId: filters.marcaId });
    }
    if (filters.categoria) {
      qb.andWhere('a.categoria = :categoria', { categoria: filters.categoria });
    }
    if (filters.anioCompra != null) {
      qb.andWhere('EXTRACT(YEAR FROM a.fecha_compra) = :anio', {
        anio: filters.anioCompra,
      });
    }
    if (filters.busqueda?.trim()) {
      const q = `%${filters.busqueda.trim().toLowerCase()}%`;
      qb.andWhere(
        `(LOWER(a.nombre) LIKE :q OR LOWER(a.codigo_inventario) LIKE :q OR LOWER(a.codigo_qr_token) LIKE :q)`,
        { q },
      );
    }

    return qb.getMany();
  }

  async findOne(id: number) {
    const activo = await this.repo().findOne({
      where: { id },
      relations: { sucursal: true, marcaRelacion: true },
    });
    if (!activo) {
      throw new NotFoundException(`Activo ${id} no encontrado`);
    }
    return activo;
  }

  async findByUuid(uuidActivo: string) {
    return this.findByPublicIdentifier(uuidActivo);
  }

  async findByPublicIdentifier(identifier: string) {
    let activo = await this.repo().findOne({
      where: { uuidActivo: identifier },
      relations: { sucursal: true, marcaRelacion: true },
    });

    if (!activo) {
      activo = await this.repo().findOne({
        where: [
          { codigoQrToken: identifier },
          { codigoInventario: identifier },
        ],
        relations: { sucursal: true, marcaRelacion: true },
      });
    }

    if (!activo) {
      throw new NotFoundException(
        `Activo con identificador ${identifier} no encontrado`,
      );
    }
    return activo;
  }

  async create(dto: CreateActivoDto) {
    const manager = this.transactionContext.getManager(this.dataSource);

    if (dto.numeroSerie) {
      const exists = await manager.findOne(Activo, {
        where: { numeroSerie: dto.numeroSerie },
      });
      if (exists) {
        throw new ConflictException('Número de serie ya registrado');
      }
    }

    const marca = await manager.findOne(Marca, { where: { id: dto.marcaId } });
    if (!marca) {
      throw new BadRequestException('Marca no encontrada');
    }

    const codigo = await this.codigoInventario.generarCodigo(
      manager,
      dto.sucursalId,
      dto.marcaId,
      dto.categoria,
      dto.fechaCompra,
    );

    const activo = manager.create(Activo, {
      nombre: dto.nombre,
      marcaId: dto.marcaId,
      marca: marca.nombre,
      modelo: dto.modelo ?? null,
      numeroSerie: dto.numeroSerie ?? null,
      categoria: dto.categoria,
      sucursalId: dto.sucursalId,
      fechaCompra: dto.fechaCompra ?? null,
      fechaVencimientoGarantia: dto.fechaVencimientoGarantia ?? null,
      costoAdquisicion:
        dto.costoAdquisicion != null ? String(dto.costoAdquisicion) : null,
      documentacionUrls: dto.documentacionUrls ?? [],
      estadoOperacional: dto.estadoOperacional,
      codigoInventario: codigo,
      codigoQrToken: codigo,
    });

    const saved = await manager.save(activo);
    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateActivoDto) {
    const activo = await this.findOne(id);
    if (dto.numeroSerie && dto.numeroSerie !== activo.numeroSerie) {
      const exists = await this.repo().findOne({
        where: { numeroSerie: dto.numeroSerie },
      });
      if (exists) {
        throw new ConflictException('Número de serie ya registrado');
      }
    }

    if (dto.marcaId != null) {
      const marca = await this.dataSource
        .getRepository(Marca)
        .findOne({ where: { id: dto.marcaId } });
      if (marca) {
        activo.marcaId = dto.marcaId;
        activo.marca = marca.nombre;
      }
    }

    Object.assign(activo, {
      ...dto,
      marcaId: dto.marcaId ?? activo.marcaId,
      costoAdquisicion:
        dto.costoAdquisicion != null
          ? String(dto.costoAdquisicion)
          : activo.costoAdquisicion,
    });

    return this.repo().save(activo);
  }
}
