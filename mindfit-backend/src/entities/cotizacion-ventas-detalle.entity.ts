import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Activo } from './activo.entity';
import { Repuesto } from './repuesto.entity';
import { CotizacionVenta } from './cotizacion-venta.entity';

@Entity('cotizacion_ventas_detalles')
export class CotizacionVentasDetalle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cotizacion_id', type: 'int' })
  cotizacionId: number;

  @ManyToOne(() => CotizacionVenta, (c) => c.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cotizacion_id' })
  cotizacion: CotizacionVenta;

  @Column({ name: 'activo_id', type: 'int', nullable: true })
  activoId: number | null;

  @ManyToOne(() => Activo, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'activo_id' })
  activo: Activo | null;

  @Column({ name: 'repuesto_id', type: 'int', nullable: true })
  repuestoId: number | null;

  @ManyToOne(() => Repuesto, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'repuesto_id' })
  repuesto: Repuesto | null;

  @Column({ name: 'sku_estatico', type: 'varchar', length: 50 })
  skuEstatico: string;

  @Column({ name: 'nombre_estatico', type: 'varchar', length: 150 })
  nombreEstatico: string;

  @Column({
    name: 'categoria_estatica',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  categoriaEstatica: string | null;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({
    name: 'precio_unitario_pactado',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  precioUnitarioPactado: string;

  @Column({
    name: 'total_linea_neto',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  totalLineaNeto: string;

  @Column({
    name: 'costo_historico_clp',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  costoHistoricoClp: string;
}
