import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EstadoSolicitudPassword } from '../common/enums';
import { Usuario } from './usuario.entity';

@Entity('solicitudes_password')
export class SolicitudPassword {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id', type: 'int' })
  usuarioId: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({
    type: 'enum',
    enum: EstadoSolicitudPassword,
    default: EstadoSolicitudPassword.PENDIENTE,
  })
  estado: EstadoSolicitudPassword;

  @Column({
    name: 'contrasena_temporal_legible',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  contrasenaTemporalLegible: string | null;

  /** Token opaco para que el usuario en login escuche vía WebSocket. */
  @Column({ name: 'watch_token', type: 'varchar', length: 64, unique: true, nullable: true })
  watchToken: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
