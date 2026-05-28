import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  ClasificacionOrden,
  EstadoOrdenTrabajo,
  PrioridadOrden,
  TipoMantenimiento,
} from '../common/enums';
import { Activo } from './activo.entity';
import { Sucursal } from './sucursal.entity';
import { Usuario } from './usuario.entity';
import { EvidenciaOt } from './evidencia-ot.entity';
import { ComentarioOt } from './comentario-ot.entity';
import { OrdenTrabajoRepuesto } from './orden-trabajo-repuesto.entity';
import { FacilidadCritica } from './facilidad-critica.entity';

@Entity('ordenes_trabajo')
export class OrdenTrabajo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'codigo_ot', type: 'varchar', length: 30, unique: true })
  codigoOt: string;

  @Column({
    type: 'varchar',
    length: 30,
    default: ClasificacionOrden.MAQUINA,
  })
  clasificacion: ClasificacionOrden;

  @Column({ name: 'activo_id', type: 'int', nullable: true })
  activoId: number | null;

  @Column({ name: 'facilidad_critica_id', type: 'int', nullable: true })
  facilidadCriticaId: number | null;

  @Column({ name: 'area_servicios', type: 'varchar', length: 20, nullable: true })
  areaServicios: 'bano' | 'camarin' | 'ducha' | null;

  @Column({
    name: 'genero_servicios',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  generoServicios: 'hombres' | 'mujeres' | null;

  @Column({
    name: 'falla_general_servicios',
    type: 'boolean',
    default: false,
  })
  fallaGeneralServicios: boolean;

  @Column({
    name: 'servicios_afectados',
    type: 'jsonb',
    nullable: true,
  })
  serviciosAfectados: string[] | null;

  @ManyToOne(() => FacilidadCritica, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'facilidad_critica_id' })
  facilidadCritica: FacilidadCritica | null;

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

  @Column({ name: 'fecha_aprobacion', type: 'timestamptz', nullable: true })
  fechaAprobacion: Date | null;

  @Column({
    name: 'costo_materiales',
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  costoMateriales: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToMany(() => EvidenciaOt, (evidencia) => evidencia.ordenTrabajo)
  evidencias: EvidenciaOt[];

  @OneToMany(() => ComentarioOt, (comentario) => comentario.ordenTrabajo)
  comentarios: ComentarioOt[];

  @OneToMany(() => OrdenTrabajoRepuesto, (consumo) => consumo.ordenTrabajo)
  consumoRepuestos: OrdenTrabajoRepuesto[];
}
