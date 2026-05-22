import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Categoria } from '../entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
  ) {}

  findAll() {
    return this.categoriaRepo.find({
      where: { deletedAt: IsNull() },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number) {
    const categoria = await this.categoriaRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!categoria) {
      throw new NotFoundException(`Categoría ${id} no encontrada`);
    }
    return categoria;
  }

  async create(dto: CreateCategoriaDto) {
    const sigla = dto.sigla.trim().toUpperCase();
    const exists = await this.categoriaRepo.findOne({
      where: [
        { nombre: dto.nombre.trim(), deletedAt: IsNull() },
        { sigla, deletedAt: IsNull() },
      ],
    });
    if (exists) {
      throw new ConflictException('Nombre o sigla de categoría ya registrados');
    }
    const categoria = this.categoriaRepo.create({
      nombre: dto.nombre.trim(),
      sigla,
    });
    return this.categoriaRepo.save(categoria);
  }

  async update(id: number, dto: UpdateCategoriaDto) {
    const categoria = await this.findOne(id);
    if (dto.nombre) categoria.nombre = dto.nombre.trim();
    if (dto.sigla) categoria.sigla = dto.sigla.trim().toUpperCase();
    return this.categoriaRepo.save(categoria);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.categoriaRepo.softDelete(id);
    return { deleted: true };
  }
}
