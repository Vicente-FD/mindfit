import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Marca } from '../entities/marca.entity';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';

@Injectable()
export class MarcasService {
  constructor(
    @InjectRepository(Marca)
    private readonly marcaRepo: Repository<Marca>,
  ) {}

  findAll() {
    return this.marcaRepo.find({
      where: { deletedAt: IsNull() },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number) {
    const marca = await this.marcaRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!marca) {
      throw new NotFoundException(`Marca ${id} no encontrada`);
    }
    return marca;
  }

  async create(dto: CreateMarcaDto, logoUrl?: string) {
    const sigla = dto.sigla.trim().toUpperCase();
    const exists = await this.marcaRepo.findOne({
      where: [
        { nombre: dto.nombre.trim(), deletedAt: IsNull() },
        { sigla, deletedAt: IsNull() },
      ],
    });
    if (exists) {
      throw new ConflictException('Nombre o sigla de marca ya registrados');
    }
    const marca = this.marcaRepo.create({
      nombre: dto.nombre.trim(),
      sigla,
      logoUrl: logoUrl ?? null,
    });
    return this.marcaRepo.save(marca);
  }

  async update(id: number, dto: UpdateMarcaDto, logoUrl?: string) {
    const marca = await this.findOne(id);
    if (dto.nombre) marca.nombre = dto.nombre.trim();
    if (dto.sigla) marca.sigla = dto.sigla.trim().toUpperCase();
    if (logoUrl !== undefined) marca.logoUrl = logoUrl;
    return this.marcaRepo.save(marca);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.marcaRepo.softDelete(id);
    return { deleted: true };
  }
}
