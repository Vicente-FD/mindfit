import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EstadoFacilidadCritica } from '../common/enums';
import { FacilidadCritica } from './facilidad-critica.entity';
import { Usuario } from './usuario.entity';

@Entity('facilidades_criticas_historial')
export class FacilidadCriticaHistorial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'facilidad_critica_id', type: 'int' })
  facilidadCriticaId: number;

  @ManyToOne(() => FacilidadCritica, (f) => f.historial, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'facilidad_critica_id' })
  facilidadCritica: FacilidadCritica;

  @Column({ name: 'estado_anterior', type: 'varchar', length: 24 })
  estadoAnterior: EstadoFacilidadCritica;

  @Column({ name: 'estado_nuevo', type: 'varchar', length: 24 })
  estadoNuevo: EstadoFacilidadCritica;

  @Column({ name: 'descripcion_problema', type: 'text', nullable: true })
  descripcionProblema: string | null;

  @Column({ name: 'reportado_por_id', type: 'int', nullable: true })
  reportadoPorId: number | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reportado_por_id' })
  reportadoPor: Usuario | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
