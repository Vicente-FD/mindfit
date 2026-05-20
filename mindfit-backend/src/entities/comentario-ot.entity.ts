import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrdenTrabajo } from './orden-trabajo.entity';
import { Usuario } from './usuario.entity';

@Entity('comentarios_ot')
export class ComentarioOt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'orden_trabajo_id', type: 'int' })
  ordenTrabajoId: number;

  @ManyToOne(() => OrdenTrabajo, (orden) => orden.comentarios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orden_trabajo_id' })
  ordenTrabajo: OrdenTrabajo;

  @Column({ name: 'autor_id', type: 'int' })
  autorId: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.comentarios, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'autor_id' })
  autor: Usuario;

  @Column({ type: 'text' })
  comentario: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
