import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    return this.marcaRepo.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: number) {
    const marca = await this.marcaRepo.findOne({ where: { id } });
    if (!marca) {
      throw new NotFoundException(`Marca ${id} no encontrada`);
    }
    return marca;
  }

  async create(dto: CreateMarcaDto) {
    const exists = await this.marcaRepo.findOne({
      where: [{ nombre: dto.nombre }, { sigla: dto.sigla.toUpperCase() }],
    });
    if (exists) {
      throw new ConflictException('Nombre o sigla de marca ya registrados');
    }
    const marca = this.marcaRepo.create({
      nombre: dto.nombre,
      sigla: dto.sigla.toUpperCase(),
    });
    return this.marcaRepo.save(marca);
  }

  async update(id: number, dto: UpdateMarcaDto) {
    const marca = await this.findOne(id);
    if (dto.nombre) marca.nombre = dto.nombre;
    if (dto.sigla) marca.sigla = dto.sigla.toUpperCase();
    return this.marcaRepo.save(marca);
  }
}
