import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BodegaStock } from './bodega-stock.entity';
import { MovimientoInventario } from './movimiento-inventario.entity';
import { OrdenTrabajoRepuesto } from './orden-trabajo-repuesto.entity';

@Entity('repuestos')
export class Repuesto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({
    name: 'costo_unitario',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  costoUnitario: string;

  @Column({ name: 'apto_para_venta', type: 'boolean', default: false })
  aptoParaVenta: boolean;

  @Column({
    name: 'precio_venta_clp',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  precioVentaClp: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToMany(() => BodegaStock, (stock) => stock.repuesto)
  stocks: BodegaStock[];

  @OneToMany(() => MovimientoInventario, (mov) => mov.repuesto)
  movimientos: MovimientoInventario[];

  @OneToMany(() => OrdenTrabajoRepuesto, (consumo) => consumo.repuesto)
  consumos: OrdenTrabajoRepuesto[];
}
