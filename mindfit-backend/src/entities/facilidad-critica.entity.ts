import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import {
  EstadoFacilidadCritica,
  TipoFacilidadCritica,
} from '../common/enums';
import { Sucursal } from './sucursal.entity';
import { Usuario } from './usuario.entity';
import { FacilidadCriticaHistorial } from './facilidad-critica-historial.entity';

@Entity('facilidades_criticas')
@Unique(['sucursalId', 'tipo'])
export class FacilidadCritica {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sucursal_id', type: 'int' })
  sucursalId: number;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.facilidadesCriticas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sucursal_id' })
  sucursal: Sucursal;

  @Column({ type: 'varchar', length: 40 })
  tipo: TipoFacilidadCritica;

  @Column({
    type: 'varchar',
    length: 24,
    default: EstadoFacilidadCritica.OPERATIVO,
  })
  estado: EstadoFacilidadCritica;

  @Column({ name: 'notas_tecnicas', type: 'text', nullable: true })
  notasTecnicas: string | null;

  @Column({ name: 'actualizado_por_id', type: 'int', nullable: true })
  actualizadoPorId: number | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actualizado_por_id' })
  actualizadoPor: Usuario | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(
    () => FacilidadCriticaHistorial,
    (historial) => historial.facilidadCritica,
  )
  historial: FacilidadCriticaHistorial[];
}
