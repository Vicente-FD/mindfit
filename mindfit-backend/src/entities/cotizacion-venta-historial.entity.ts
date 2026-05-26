import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CotizacionVenta } from './cotizacion-venta.entity';
import { Usuario } from './usuario.entity';

export type TipoHistorialCotizacion =
  | 'creacion'
  | 'edicion'
  | 'cambio_estado';

@Entity('cotizacion_ventas_historial')
export class CotizacionVentaHistorial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cotizacion_id', type: 'int' })
  cotizacionId: number;

  @ManyToOne(() => CotizacionVenta, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cotizacion_id' })
  cotizacion: CotizacionVenta;

  @Column({ name: 'usuario_id', type: 'int', nullable: true })
  usuarioId: number | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario | null;

  @Column({ type: 'varchar', length: 30 })
  tipo: TipoHistorialCotizacion;

  @Column({ type: 'text' })
  resumen: string;

  @Column({ type: 'jsonb', nullable: true })
  cambios: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
