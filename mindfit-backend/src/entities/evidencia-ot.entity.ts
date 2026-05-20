import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TipoEvidencia } from '../common/enums';
import { OrdenTrabajo } from './orden-trabajo.entity';
import { Usuario } from './usuario.entity';

@Entity('evidencia_ot')
export class EvidenciaOt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'orden_trabajo_id', type: 'int' })
  ordenTrabajoId: number;

  @ManyToOne(() => OrdenTrabajo, (orden) => orden.evidencias, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orden_trabajo_id' })
  ordenTrabajo: OrdenTrabajo;

  @Column({ name: 'tipo_evidencia', type: 'enum', enum: TipoEvidencia })
  tipoEvidencia: TipoEvidencia;

  @Column({ name: 'url_imagen', type: 'varchar', length: 500 })
  urlImagen: string;

  @Column({ name: 'cargado_por_id', type: 'int' })
  cargadoPorId: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.evidenciasCargadas, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'cargado_por_id' })
  cargadoPor: Usuario;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
