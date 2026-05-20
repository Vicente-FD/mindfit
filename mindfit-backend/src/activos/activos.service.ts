import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Activo } from '../entities/activo.entity';
import { TransactionContextService } from '../common/database/transaction-context.service';
import { CreateActivoDto } from './dto/create-activo.dto';
import { UpdateActivoDto } from './dto/update-activo.dto';

@Injectable()
export class ActivosService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly transactionContext: TransactionContextService,
  ) {}

  private repo() {
    return this.transactionContext.getRepository(Activo, this.dataSource);
  }

  findAll(sucursalId?: number) {
    return this.repo().find({
      where: sucursalId ? { sucursalId } : {},
      relations: { sucursal: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number) {
    const activo = await this.repo().findOne({
      where: { id },
      relations: { sucursal: true },
    });
    if (!activo) {
      throw new NotFoundException(`Activo ${id} no encontrado`);
    }
    return activo;
  }

  async findByUuid(uuidActivo: string) {
    const activo = await this.repo().findOne({
      where: { uuidActivo },
      relations: { sucursal: true },
    });
    if (!activo) {
      throw new NotFoundException(
        `Activo con UUID ${uuidActivo} no encontrado`,
      );
    }
    return activo;
  }

  async create(dto: CreateActivoDto) {
    if (dto.numeroSerie) {
      const exists = await this.repo().findOne({
        where: { numeroSerie: dto.numeroSerie },
      });
      if (exists) {
        throw new ConflictException('Número de serie ya registrado');
      }
    }

    const activo = this.repo().create({
      nombre: dto.nombre,
      marca: dto.marca ?? null,
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
    });

    return this.repo().save(activo);
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

    Object.assign(activo, {
      ...dto,
      costoAdquisicion:
        dto.costoAdquisicion != null
          ? String(dto.costoAdquisicion)
          : activo.costoAdquisicion,
    });

    return this.repo().save(activo);
  }
}
