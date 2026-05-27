import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EtapaOportunidad } from '../common/enums';
import { Oportunidad } from '../entities/oportunidad.entity';
import { ClientesService } from '../clientes/clientes.service';
import { CreateOportunidadDto } from './dto/create-oportunidad.dto';
import { UpdateOportunidadDto } from './dto/update-oportunidad.dto';

@Injectable()
export class OportunidadesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly clientesService: ClientesService,
  ) {}

  private repo() {
    return this.dataSource.getRepository(Oportunidad);
  }

  findAll() {
    return this.repo().find({
      relations: { cliente: true, creadoPor: true },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const o = await this.repo().findOne({
      where: { id },
      relations: { cliente: true, creadoPor: true },
    });
    if (!o) throw new NotFoundException(`Oportunidad ${id} no encontrada`);
    return o;
  }

  async create(dto: CreateOportunidadDto, creadoPorId: number) {
    await this.clientesService.findOne(dto.clienteId);
    const opp = this.repo().create({
      clienteId: dto.clienteId,
      creadoPorId,
      titulo: dto.titulo.trim(),
      etapa: dto.etapa ?? EtapaOportunidad.PROSPECCION,
      montoEstimado: String(dto.montoEstimado ?? 0),
      divisaCodigo: dto.divisaCodigo ?? 'CLP',
      notas: dto.notas?.trim() ?? null,
      fechaCierreEstimada: dto.fechaCierreEstimada ?? null,
      checklist: this.checklistDefault(),
      actividades: [],
    });
    const saved = await this.repo().save(opp);
    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateOportunidadDto) {
    const opp = await this.findOne(id);
    if (dto.titulo != null) opp.titulo = dto.titulo.trim();
    if (dto.etapa != null) opp.etapa = dto.etapa;
    if (dto.montoEstimado != null) {
      opp.montoEstimado = String(dto.montoEstimado);
    }
    if (dto.divisaCodigo != null) opp.divisaCodigo = dto.divisaCodigo;
    if (dto.notas !== undefined) opp.notas = dto.notas?.trim() ?? null;
    if (dto.fechaCierreEstimada !== undefined) {
      opp.fechaCierreEstimada = dto.fechaCierreEstimada || null;
    }
    if (dto.checklist != null) opp.checklist = dto.checklist;
    if (dto.actividades != null) {
      opp.actividades = dto.actividades.map((a) => ({
        id: a.id,
        texto: a.texto,
        createdAt: a.createdAt ?? new Date().toISOString(),
      }));
    }
    await this.repo().save(opp);
    return this.findOne(id);
  }

  async marcarGanada(id: number) {
    return this.update(id, { etapa: EtapaOportunidad.GANADA });
  }

  private checklistDefault() {
    return [
      { id: '1', texto: 'Llamar al cliente', completado: false },
      { id: '2', texto: 'Enviar propuesta', completado: false },
      { id: '3', texto: 'Visita técnica', completado: false },
    ];
  }
}
