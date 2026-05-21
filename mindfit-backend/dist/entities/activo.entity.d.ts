import { CategoriaActivo, EstadoOperacionalActivo } from '../common/enums';
import { Sucursal } from './sucursal.entity';
import { Marca } from './marca.entity';
import { OrdenTrabajo } from './orden-trabajo.entity';
export declare class Activo {
    id: number;
    uuidActivo: string;
    codigoQrToken: string | null;
    codigoInventario: string | null;
    nombre: string;
    marcaId: number | null;
    marcaRelacion: Marca | null;
    marca: string | null;
    modelo: string | null;
    numeroSerie: string | null;
    categoria: CategoriaActivo;
    sucursalId: number;
    sucursal: Sucursal;
    fechaCompra: string | null;
    fechaVencimientoGarantia: string | null;
    costoAdquisicion: string | null;
    documentacionUrls: string[];
    estadoOperacional: EstadoOperacionalActivo;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    ordenesTrabajo: OrdenTrabajo[];
    generarUuid(): void;
}
