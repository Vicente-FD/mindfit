import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Repuesto } from './repuesto.entity';

/** Stock único de bodega central (compartido por todas las sucursales). */
@Entity('bodega_stock')
@Unique('uq_bodega_repuesto', ['repuestoId'])
export class BodegaStock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'repuesto_id', type: 'int' })
  repuestoId: number;

  @ManyToOne(() => Repuesto, (repuesto) => repuesto.stocks, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'repuesto_id' })
  repuesto: Repuesto;

  @Column({ name: 'cantidad_actual', type: 'int', default: 0 })
  cantidadActual: number;

  @Column({ name: 'cantidad_minima_alerta', type: 'int', default: 5 })
  cantidadMinimaAlerta: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
