import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { Activo } from './activo.entity';
import { OrdenTrabajo } from './orden-trabajo.entity';

@Entity('sucursales')
export class Sucursal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150, unique: true })
  nombre: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  sigla: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  direccion: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  comuna: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ciudad: string | null;

  @Column({ name: 'esta_activa', type: 'boolean', default: true })
  estaActiva: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Usuario, (usuario) => usuario.sucursal)
  usuarios: Usuario[];

  @OneToMany(() => Activo, (activo) => activo.sucursal)
  activos: Activo[];

  @OneToMany(() => OrdenTrabajo, (orden) => orden.sucursal)
  ordenesTrabajo: OrdenTrabajo[];
}
