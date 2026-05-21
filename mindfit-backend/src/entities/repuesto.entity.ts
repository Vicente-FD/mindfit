import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BodegaStock } from './bodega-stock.entity';
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => BodegaStock, (stock) => stock.repuesto)
  stocks: BodegaStock[];

  @OneToMany(() => OrdenTrabajoRepuesto, (consumo) => consumo.repuesto)
  consumos: OrdenTrabajoRepuesto[];
}
