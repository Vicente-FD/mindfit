import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EstadoRendicionGasto } from '../common/enums/estado-rendicion-gasto.enum';
import { Usuario } from './usuario.entity';

@Entity('rendiciones_gastos')
export class RendicionGasto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tecnico_id', type: 'int' })
  tecnicoId: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tecnico_id' })
  tecnico: Usuario;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  monto: number;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ name: 'url_boleta', type: 'text' })
  urlBoleta: string;

  @Column({
    type: 'varchar',
    length: 30,
    default: EstadoRendicionGasto.PENDIENTE,
  })
  estado: EstadoRendicionGasto;

  @Column({ name: 'motivo_rechazo', type: 'text', nullable: true })
  motivoRechazo: string | null;

  @Column({ name: 'fecha_gasto', type: 'date' })
  fechaGasto: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
