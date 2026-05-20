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
import { RolUsuario } from '../common/enums';
import type { PermisosUi } from '../common/interfaces/permisos-ui.interface';
import { Sucursal } from './sucursal.entity';
import { OrdenTrabajo } from './orden-trabajo.entity';
import { EvidenciaOt } from './evidencia-ot.entity';
import { ComentarioOt } from './comentario-ot.entity';
import { AuditTrail } from './audit-trail.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'enum', enum: RolUsuario })
  rol: RolUsuario;

  @Column({ name: 'sucursal_id', type: 'int', nullable: true })
  sucursalId: number | null;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.usuarios, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'sucursal_id' })
  sucursal: Sucursal | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefono: string | null;

  @Column({ name: 'esta_activo', type: 'boolean', default: true })
  estaActivo: boolean;

  @Column({ name: 'permisos_ui', type: 'jsonb', default: () => "'{}'" })
  permisosUi: PermisosUi;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => OrdenTrabajo, (orden) => orden.creadoPor)
  ordenesCreadas: OrdenTrabajo[];

  @OneToMany(() => OrdenTrabajo, (orden) => orden.asignadoA)
  ordenesAsignadas: OrdenTrabajo[];

  @OneToMany(() => EvidenciaOt, (evidencia) => evidencia.cargadoPor)
  evidenciasCargadas: EvidenciaOt[];

  @OneToMany(() => ComentarioOt, (comentario) => comentario.autor)
  comentarios: ComentarioOt[];

  @OneToMany(() => AuditTrail, (audit) => audit.usuario)
  auditorias: AuditTrail[];
}
