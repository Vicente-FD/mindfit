import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Activo } from '../entities/activo.entity';
import { Categoria } from '../entities/categoria.entity';
import { Marca } from '../entities/marca.entity';
import { Sucursal } from '../entities/sucursal.entity';

@Injectable()
export class CodigoInventarioService {
  constructor(private readonly dataSource: DataSource) {}

  async generarCodigo(
    manager: EntityManager,
    sucursalId: number | null | undefined,
    marcaId: number,
    categoriaId: number,
    fechaCompra?: string | null,
  ): Promise<string> {
    let siglaSede: string;
    if (sucursalId == null) {
      siglaSede = 'BC';
    } else {
      const sucursal = await manager.findOne(Sucursal, {
        where: { id: sucursalId },
      });
      if (!sucursal?.sigla) {
        throw new BadRequestException('La sucursal no tiene sigla configurada');
      }
      siglaSede = sucursal.sigla;
    }

    const marca = await manager.findOne(Marca, { where: { id: marcaId } });
    if (!marca?.sigla) {
      throw new BadRequestException('La marca no tiene sigla configurada');
    }

    const categoria = await manager.findOne(Categoria, {
      where: { id: categoriaId },
    });
    if (!categoria?.sigla) {
      throw new BadRequestException('La categoría no tiene sigla configurada');
    }

    const year = this.resolveYear(fechaCompra);
    const prefix = `${siglaSede}-${marca.sigla}-${year}-${categoria.sigla}-`;

    const rows = await manager
      .createQueryBuilder(Activo, 'a')
      .select('a.codigoInventario', 'codigo')
      .where('a.codigoInventario LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('a.codigoInventario', 'DESC')
      .setLock('pessimistic_write')
      .limit(1)
      .getRawMany<{ codigo: string }>();

    let correlativo = 1;
    if (rows.length > 0 && rows[0].codigo) {
      const parts = rows[0].codigo.split('-');
      const last = parseInt(parts[parts.length - 1], 10);
      if (!Number.isNaN(last)) {
        correlativo = last + 1;
      }
    }

    if (correlativo > 99) {
      throw new BadRequestException(
        'Límite de correlativo alcanzado para esta combinación sede/marca/categoría',
      );
    }

    return `${prefix}${String(correlativo).padStart(2, '0')}`;
  }

  private resolveYear(fechaCompra?: string | null): string {
    if (fechaCompra) {
      const d = new Date(fechaCompra);
      if (!Number.isNaN(d.getTime())) {
        return String(d.getFullYear()).slice(-2);
      }
    }
    return String(new Date().getFullYear()).slice(-2);
  }
}
