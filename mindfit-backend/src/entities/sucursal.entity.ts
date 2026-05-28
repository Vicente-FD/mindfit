import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { Activo } from './activo.entity';
import { OrdenTrabajo } from './orden-trabajo.entity';
import { FacilidadCritica } from './facilidad-critica.entity';
import type { CapacidadesServicios } from '../common/types/capacidades-servicios.types';

@Entity('sucursales')
export class Sucursal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150, unique: true })
  nombre: string;

  @Column({ type: 'varchar', length: 5, unique: true })
  sigla: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  direccion: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  comuna: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ciudad: string | null;

  @Column({ name: 'esta_activa', type: 'boolean', default: true })
  estaActiva: boolean;

  @Column({ name: 'cantidad_pisos', type: 'int', default: 1 })
  cantidadPisos: number;

  @Column({ name: 'capacidades_servicios', type: 'jsonb', nullable: true })
  capacidadesServicios: CapacidadesServicios | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToMany(() => Usuario, (usuario) => usuario.sucursal)
  usuarios: Usuario[];

  @OneToMany(() => Activo, (activo) => activo.sucursal)
  activos: Activo[];

  @OneToMany(() => OrdenTrabajo, (orden) => orden.sucursal)
  ordenesTrabajo: OrdenTrabajo[];

  @OneToMany(() => FacilidadCritica, (f) => f.sucursal)
  facilidadesCriticas: FacilidadCritica[];
}
