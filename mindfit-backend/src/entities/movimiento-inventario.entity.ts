import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TipoMovimientoInventario } from '../common/enums';
import { OrdenTrabajo } from './orden-trabajo.entity';
import { Repuesto } from './repuesto.entity';
import { Sucursal } from './sucursal.entity';
import { Usuario } from './usuario.entity';

@Entity('movimientos_inventario')
export class MovimientoInventario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sucursal_id', type: 'int' })
  sucursalId: number;

  @ManyToOne(() => Sucursal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sucursal_id' })
  sucursal: Sucursal;

  @Column({ name: 'repuesto_id', type: 'int' })
  repuestoId: number;

  @ManyToOne(() => Repuesto, (repuesto) => repuesto.movimientos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'repuesto_id' })
  repuesto: Repuesto;

  @Column({ name: 'usuario_id', type: 'int' })
  usuarioId: number;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'tipo_movimiento', type: 'varchar', length: 30 })
  tipoMovimiento: TipoMovimientoInventario;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({
    name: 'costo_unitario_momento',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  costoUnitarioMomento: string;

  @Column({ name: 'orden_trabajo_id', type: 'int', nullable: true })
  ordenTrabajoId: number | null;

  @ManyToOne(() => OrdenTrabajo, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'orden_trabajo_id' })
  ordenTrabajo: OrdenTrabajo | null;

  @Column({ type: 'text' })
  motivo: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
