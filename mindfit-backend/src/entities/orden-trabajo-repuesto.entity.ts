import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrdenTrabajo } from './orden-trabajo.entity';
import { Repuesto } from './repuesto.entity';

@Entity('orden_trabajo_repuestos')
export class OrdenTrabajoRepuesto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'orden_trabajo_id', type: 'int' })
  ordenTrabajoId: number;

  @ManyToOne(() => OrdenTrabajo, (orden) => orden.consumoRepuestos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orden_trabajo_id' })
  ordenTrabajo: OrdenTrabajo;

  @Column({ name: 'repuesto_id', type: 'int' })
  repuestoId: number;

  @ManyToOne(() => Repuesto, (repuesto) => repuesto.consumos, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'repuesto_id' })
  repuesto: Repuesto;

  @Column({ name: 'cantidad_usada', type: 'int' })
  cantidadUsada: number;

  @Column({
    name: 'costo_unitario_aplicado',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  costoUnitarioAplicado: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
