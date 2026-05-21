import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Activo } from './activo.entity';

@Entity('planes_preventivos')
export class PlanPreventivo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ name: 'activo_id', type: 'int' })
  activoId: number;

  @ManyToOne(() => Activo, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'activo_id' })
  equipo: Activo;

  @Column({ name: 'intervalo_dias', type: 'int' })
  intervaloDias: number;

  @Column({ name: 'proxima_fecha_ejecucion', type: 'date' })
  proximaFechaEjecucion: string;

  /** Plan habilitado para el cron automático */
  @Column({ name: 'activo', type: 'boolean', default: true })
  planActivo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
