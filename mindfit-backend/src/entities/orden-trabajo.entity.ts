import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  EstadoOrdenTrabajo,
  PrioridadOrden,
  TipoMantenimiento,
} from '../common/enums';
import { Activo } from './activo.entity';
import { Sucursal } from './sucursal.entity';
import { Usuario } from './usuario.entity';
import { EvidenciaOt } from './evidencia-ot.entity';
import { ComentarioOt } from './comentario-ot.entity';

@Entity('ordenes_trabajo')
export class OrdenTrabajo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'codigo_ot', type: 'varchar', length: 30, unique: true })
  codigoOt: string;

  @Column({ name: 'activo_id', type: 'int', nullable: true })
  activoId: number | null;

  @ManyToOne(() => Activo, (activo) => activo.ordenesTrabajo, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'activo_id' })
  activo: Activo | null;

  @Column({ name: 'sucursal_id', type: 'int' })
  sucursalId: number;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.ordenesTrabajo, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'sucursal_id' })
  sucursal: Sucursal;

  @Column({ name: 'creado_por_id', type: 'int' })
  creadoPorId: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.ordenesCreadas, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'creado_por_id' })
  creadoPor: Usuario;

  @Column({ name: 'asignado_a_id', type: 'int', nullable: true })
  asignadoAId: number | null;

  @ManyToOne(() => Usuario, (usuario) => usuario.ordenesAsignadas, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'asignado_a_id' })
  asignadoA: Usuario | null;

  @Column({ type: 'varchar', length: 200 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'enum', enum: PrioridadOrden, default: PrioridadOrden.MEDIA })
  prioridad: PrioridadOrden;

  @Column({ name: 'tipo_mantenimiento', type: 'enum', enum: TipoMantenimiento })
  tipoMantenimiento: TipoMantenimiento;

  @Column({
    type: 'enum',
    enum: EstadoOrdenTrabajo,
    default: EstadoOrdenTrabajo.PENDIENTE,
  })
  estado: EstadoOrdenTrabajo;

  @Column({ name: 'tiempo_estimado_minutos', type: 'int', nullable: true })
  tiempoEstimadoMinutos: number | null;

  @Column({ name: 'fecha_programacion', type: 'timestamptz', nullable: true })
  fechaProgramacion: Date | null;

  @Column({ name: 'fecha_inicio_real', type: 'timestamptz', nullable: true })
  fechaInicioReal: Date | null;

  @Column({ name: 'fecha_fin_real', type: 'timestamptz', nullable: true })
  fechaFinReal: Date | null;

  @Column({ name: 'motivo_rechazo', type: 'text', nullable: true })
  motivoRechazo: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => EvidenciaOt, (evidencia) => evidencia.ordenTrabajo)
  evidencias: EvidenciaOt[];

  @OneToMany(() => ComentarioOt, (comentario) => comentario.ordenTrabajo)
  comentarios: ComentarioOt[];
}
