import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { CategoriaActivo } from '../common/enums';
import { Activo } from '../entities/activo.entity';
import { Marca } from '../entities/marca.entity';
import { Sucursal } from '../entities/sucursal.entity';

const CATEGORIA_CODIGO: Record<CategoriaActivo, string> = {
  [CategoriaActivo.CARDIO]: '01',
  [CategoriaActivo.FUERZA]: '02',
  [CategoriaActivo.CLIMATIZACION]: '03',
  [CategoriaActivo.INFRAESTRUCTURA]: '04',
  [CategoriaActivo.BOMBA_AGUA]: '05',
};

@Injectable()
export class CodigoInventarioService {
  constructor(private readonly dataSource: DataSource) {}

  async generarCodigo(
    manager: EntityManager,
    sucursalId: number,
    marcaId: number,
    categoria: CategoriaActivo,
    fechaCompra?: string | null,
  ): Promise<string> {
    const sucursal = await manager.findOne(Sucursal, {
      where: { id: sucursalId },
    });
    if (!sucursal?.sigla) {
      throw new BadRequestException('La sucursal no tiene sigla configurada');
    }

    const marca = await manager.findOne(Marca, { where: { id: marcaId } });
    if (!marca?.sigla) {
      throw new BadRequestException('La marca no tiene sigla configurada');
    }

    const year = this.resolveYear(fechaCompra);
    const catCode = CATEGORIA_CODIGO[categoria];
    const prefix = `${sucursal.sigla}-${marca.sigla}-${year}-${catCode}-`;

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
        'Límite de correlativo alcanzado para esta combinación',
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
