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
import { EtapaOportunidad } from '../common/enums';
import { Cliente } from './cliente.entity';
import { Usuario } from './usuario.entity';
import { CotizacionVenta } from './cotizacion-venta.entity';

export interface OportunidadChecklistItem {
  id: string;
  texto: string;
  completado: boolean;
}

export interface OportunidadActividad {
  id: string;
  texto: string;
  createdAt: string;
}

@Entity('oportunidades')
export class Oportunidad {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cliente_id', type: 'int' })
  clienteId: number;

  @ManyToOne(() => Cliente, (c) => c.oportunidades, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ name: 'creado_por_id', type: 'int' })
  creadoPorId: number;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'creado_por_id' })
  creadoPor: Usuario;

  @Column({ type: 'varchar', length: 150 })
  titulo: string;

  @Column({
    type: 'varchar',
    length: 30,
    default: EtapaOportunidad.PROSPECCION,
  })
  etapa: EtapaOportunidad;

  @Column({
    name: 'monto_estimado',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  montoEstimado: string;

  @Column({ name: 'divisa_codigo', type: 'varchar', length: 3, default: 'CLP' })
  divisaCodigo: string;

  @Column({ type: 'text', nullable: true })
  notas: string | null;

  @Column({ name: 'fecha_cierre_estimada', type: 'date', nullable: true })
  fechaCierreEstimada: string | null;

  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" })
  checklist: OportunidadChecklistItem[];

  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" })
  actividades: OportunidadActividad[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => CotizacionVenta, (c) => c.oportunidad)
  cotizaciones: CotizacionVenta[];
}
