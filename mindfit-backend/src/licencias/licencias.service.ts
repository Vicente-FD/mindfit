import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { unlink } from 'fs/promises';
import { DataSource, IsNull } from 'typeorm';
import {
  buildLicenciaPublicUrl,
  resolveLicenciaDiskPath,
} from './storage/licencias-documentos.storage';
import { RolUsuario } from '../common/enums';
import { LicenciaTecnico } from '../entities/licencia-tecnico.entity';
import { Usuario } from '../entities/usuario.entity';
import { CreateLicenciaDto } from './dto/create-licencia.dto';
import { UpdateLicenciaDto } from './dto/update-licencia.dto';
import {
  diasHastaVencimiento,
  licenciaRequiereAtencion,
} from './licencias-alertas.util';

export interface LicenciaPanelRow {
  tecnicoId: number;
  tecnicoNombre: string;
  tecnicoEmail: string;
  licenciaId: number | null;
  tipoLicencia: string | null;
  fechaVencimiento: string | null;
  documentoUrl: string | null;
  diasRestantes: number | null;
}

@Injectable()
export class LicenciasService {
  constructor(private readonly dataSource: DataSource) {}

  private licenciaRepo() {
    return this.dataSource.getRepository(LicenciaTecnico);
  }

  private usuarioRepo() {
    return this.dataSource.getRepository(Usuario);
  }

  async findPanel(): Promise<LicenciaPanelRow[]> {
    const tecnicos = await this.usuarioRepo().find({
      where: {
        rol: RolUsuario.TECNICO,
        estaActivo: true,
        deletedAt: IsNull(),
      },
      order: { nombre: 'ASC' },
    });

    const licencias = await this.licenciaRepo().find({
      where: { deletedAt: IsNull() },
      relations: { tecnico: true },
    });
    const byTecnico = new Map(licencias.map((l) => [l.tecnicoId, l]));

    return tecnicos.map((t) => {
      const lic = byTecnico.get(t.id) ?? null;
      return {
        tecnicoId: t.id,
        tecnicoNombre: t.nombre,
        tecnicoEmail: t.email,
        licenciaId: lic?.id ?? null,
        tipoLicencia: lic?.tipoLicencia ?? null,
        fechaVencimiento: lic?.fechaVencimiento ?? null,
        documentoUrl: lic?.documentoUrl ?? null,
        diasRestantes: lic
          ? diasHastaVencimiento(lic.fechaVencimiento)
          : null,
      };
    });
  }

  findAll() {
    return this.licenciaRepo().find({
      where: { deletedAt: IsNull() },
      relations: { tecnico: true },
      order: { fechaVencimiento: 'ASC' },
    });
  }

  async findAlertas() {
    const licencias = await this.findAll();
    return licencias.filter((l) => licenciaRequiereAtencion(l.fechaVencimiento));
  }

  async findOne(id: number) {
    const lic = await this.licenciaRepo().findOne({
      where: { id, deletedAt: IsNull() },
      relations: { tecnico: true },
    });
    if (!lic) throw new NotFoundException(`Licencia ${id} no encontrada`);
    return lic;
  }

  private async assertTecnicoActivo(tecnicoId: number) {
    const t = await this.usuarioRepo().findOne({
      where: {
        id: tecnicoId,
        rol: RolUsuario.TECNICO,
        estaActivo: true,
        deletedAt: IsNull(),
      },
    });
    if (!t) {
      throw new NotFoundException(
        `Técnico activo ${tecnicoId} no encontrado`,
      );
    }
    return t;
  }

  private async setDocumentoUrl(
    lic: LicenciaTecnico,
    filename: string,
  ): Promise<void> {
    const prev = lic.documentoUrl
      ? resolveLicenciaDiskPath(lic.documentoUrl)
      : null;
    lic.documentoUrl = buildLicenciaPublicUrl(filename);
    if (prev) {
      await unlink(prev).catch(() => undefined);
    }
  }

  async create(dto: CreateLicenciaDto, documentoFilename: string) {
    if (!documentoFilename?.trim()) {
      throw new BadRequestException('Documento de licencia requerido');
    }
    await this.assertTecnicoActivo(dto.tecnicoId);
    const documentoUrl = buildLicenciaPublicUrl(documentoFilename);

    const existing = await this.licenciaRepo().findOne({
      where: { tecnicoId: dto.tecnicoId },
      withDeleted: true,
    });

    if (existing?.deletedAt == null && existing) {
      throw new ConflictException(
        'El técnico ya tiene una licencia registrada. Use actualizar.',
      );
    }

    if (existing?.deletedAt) {
      await this.licenciaRepo().recover(existing);
      existing.tipoLicencia = dto.tipoLicencia.trim();
      existing.fechaVencimiento = dto.fechaVencimiento;
      await this.setDocumentoUrl(existing, documentoFilename);
      return this.licenciaRepo().save(existing);
    }

    const lic = this.licenciaRepo().create({
      tecnicoId: dto.tecnicoId,
      tipoLicencia: dto.tipoLicencia.trim(),
      fechaVencimiento: dto.fechaVencimiento,
      documentoUrl,
    });
    return this.licenciaRepo().save(lic);
  }

  async update(
    id: number,
    dto: UpdateLicenciaDto,
    documentoFilename?: string,
  ) {
    const lic = await this.findOne(id);
    if (dto.tipoLicencia !== undefined) {
      lic.tipoLicencia = dto.tipoLicencia.trim();
    }
    if (dto.fechaVencimiento !== undefined) {
      lic.fechaVencimiento = dto.fechaVencimiento;
    }
    if (documentoFilename) {
      await this.setDocumentoUrl(lic, documentoFilename);
    }
    return this.licenciaRepo().save(lic);
  }

  async remove(id: number) {
    const lic = await this.findOne(id);
    await this.licenciaRepo().softRemove(lic);
  }
}
