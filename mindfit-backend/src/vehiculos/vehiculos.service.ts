import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import { Vehiculo } from '../entities/vehiculo.entity';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import {
  AlertasVehiculo,
  calcularAlertasVehiculo,
  vehiculoRequiereAtencion,
} from './flota-alertas.util';

export type VehiculoConAlertas = Vehiculo & { alertas: AlertasVehiculo };

@Injectable()
export class VehiculosService {
  constructor(private readonly dataSource: DataSource) {}

  private repo() {
    return this.dataSource.getRepository(Vehiculo);
  }

  findAll() {
    return this.repo().find({
      where: { deletedAt: IsNull() },
      relations: { sucursal: true, conductor: true },
      order: { patente: 'ASC' },
    });
  }

  async findAlertas(): Promise<VehiculoConAlertas[]> {
    const all = await this.findAll();
    return all
      .filter(vehiculoRequiereAtencion)
      .map((v) => ({
        ...v,
        alertas: calcularAlertasVehiculo(v),
      }));
  }

  async findOne(id: number) {
    const v = await this.repo().findOne({
      where: { id, deletedAt: IsNull() },
      relations: { sucursal: true, conductor: true },
    });
    if (!v) throw new NotFoundException(`Vehículo ${id} no encontrado`);
    return v;
  }

  async create(dto: CreateVehiculoDto) {
    const patente = dto.patente.trim().toUpperCase();
    const dup = await this.repo().findOne({
      where: { patente },
      withDeleted: true,
    });
    if (dup?.deletedAt == null && dup) {
      throw new ConflictException(`Patente ${patente} ya registrada`);
    }
    if (dup?.deletedAt) {
      await this.repo().recover(dup);
      Object.assign(dup, this.mapDto(dto, patente));
      return this.repo().save(dup);
    }

    const vehiculo = this.repo().create(this.mapDto(dto, patente));
    return this.repo().save(vehiculo);
  }

  async update(id: number, dto: UpdateVehiculoDto) {
    const v = await this.findOne(id);
    if (dto.patente !== undefined) {
      const patente = dto.patente.trim().toUpperCase();
      if (patente !== v.patente) {
        const dup = await this.repo().findOne({ where: { patente } });
        if (dup && dup.id !== id) {
          throw new ConflictException(`Patente ${patente} ya registrada`);
        }
        v.patente = patente;
      }
    }
    if (dto.marca !== undefined) v.marca = dto.marca.trim();
    if (dto.modelo !== undefined) v.modelo = dto.modelo.trim();
    if (dto.anio !== undefined) v.anio = dto.anio;
    if (dto.kilometrajeActual !== undefined) {
      v.kilometrajeActual = dto.kilometrajeActual;
    }
    if (dto.siguienteCambioAceiteKm !== undefined) {
      v.siguienteCambioAceiteKm = dto.siguienteCambioAceiteKm;
    }
    if (dto.sucursalId !== undefined) v.sucursalId = dto.sucursalId ?? null;
    if (dto.conductorId !== undefined) v.conductorId = dto.conductorId ?? null;
    if (dto.vencimientoSoap !== undefined) v.vencimientoSoap = dto.vencimientoSoap;
    if (dto.vencimientoPermiso !== undefined) {
      v.vencimientoPermiso = dto.vencimientoPermiso;
    }
    if (dto.vencimientoRevision !== undefined) {
      v.vencimientoRevision = dto.vencimientoRevision;
    }
    if (dto.documentosUrls !== undefined) {
      v.documentosUrls = dto.documentosUrls;
    }
    return this.repo().save(v);
  }

  async remove(id: number) {
    const v = await this.findOne(id);
    await this.repo().softRemove(v);
  }

  private mapDto(dto: CreateVehiculoDto, patente: string) {
    return {
      patente,
      marca: dto.marca.trim(),
      modelo: dto.modelo.trim(),
      anio: dto.anio,
      kilometrajeActual: dto.kilometrajeActual,
      siguienteCambioAceiteKm: dto.siguienteCambioAceiteKm,
      sucursalId: dto.sucursalId ?? null,
      conductorId: dto.conductorId ?? null,
      vencimientoSoap: dto.vencimientoSoap,
      vencimientoPermiso: dto.vencimientoPermiso,
      vencimientoRevision: dto.vencimientoRevision,
      documentosUrls: dto.documentosUrls ?? null,
    };
  }
}
