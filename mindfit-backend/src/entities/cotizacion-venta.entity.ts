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
import { EstadoCotizacionVenta } from '../common/enums';
import { Cliente } from './cliente.entity';
import { Usuario } from './usuario.entity';
import { Oportunidad } from './oportunidad.entity';
import { CotizacionVentasDetalle } from './cotizacion-ventas-detalle.entity';

@Entity('cotizaciones_ventas')
export class CotizacionVenta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  folio: string;

  @Column({ name: 'cliente_id', type: 'int' })
  clienteId: number;

  @ManyToOne(() => Cliente, (c) => c.cotizaciones, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ name: 'creado_por_id', type: 'int' })
  creadoPorId: number;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'creado_por_id' })
  creadoPor: Usuario;

  @Column({ name: 'oportunidad_id', type: 'int', nullable: true })
  oportunidadId: number | null;

  @ManyToOne(() => Oportunidad, (o) => o.cotizaciones, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'oportunidad_id' })
  oportunidad: Oportunidad | null;

  @Column({ name: 'divisa_codigo', type: 'varchar', length: 3, default: 'CLP' })
  divisaCodigo: string;

  @Column({
    name: 'tasa_cambio_clp',
    type: 'decimal',
    precision: 12,
    scale: 6,
    default: 1,
  })
  tasaCambioClp: string;

  @Column({
    name: 'subtotal_neto',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  subtotalNeto: string;

  @Column({
    name: 'monto_iva',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  montoIva: string;

  @Column({
    name: 'monto_bruto',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  montoBruto: string;

  @Column({ name: 'comentarios_comerciales', type: 'text', nullable: true })
  comentariosComerciales: string | null;

  @Column({
    type: 'varchar',
    length: 30,
    default: EstadoCotizacionVenta.PENDIENTE_APROBACION,
  })
  estado: EstadoCotizacionVenta;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => CotizacionVentasDetalle, (d) => d.cotizacion, {
    cascade: true,
  })
  detalles: CotizacionVentasDetalle[];
}
