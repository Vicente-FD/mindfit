import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  CategoriaActivo,
  EstadoOperacionalActivo,
} from '../common/enums';
import { Sucursal } from './sucursal.entity';
import { OrdenTrabajo } from './orden-trabajo.entity';

@Entity('activos')
export class Activo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'uuid_activo',
    type: 'uuid',
    unique: true,
  })
  uuidActivo: string;

  @Column({ name: 'codigo_qr_token', type: 'varchar', length: 64, unique: true })
  codigoQrToken: string;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  marca: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  modelo: string | null;

  @Column({
    name: 'numero_serie',
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: true,
  })
  numeroSerie: string | null;

  @Column({ type: 'enum', enum: CategoriaActivo })
  categoria: CategoriaActivo;

  @Column({ name: 'sucursal_id', type: 'int' })
  sucursalId: number;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.activos, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'sucursal_id' })
  sucursal: Sucursal;

  @Column({ name: 'fecha_compra', type: 'date', nullable: true })
  fechaCompra: string | null;

  @Column({ name: 'fecha_vencimiento_garantia', type: 'date', nullable: true })
  fechaVencimientoGarantia: string | null;

  @Column({
    name: 'costo_adquisicion',
    type: 'decimal',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  costoAdquisicion: string | null;

  @Column({ name: 'documentacion_urls', type: 'jsonb', default: () => "'[]'" })
  documentacionUrls: string[];

  @Column({
    name: 'estado_operacional',
    type: 'enum',
    enum: EstadoOperacionalActivo,
    default: EstadoOperacionalActivo.OPERATIVO,
  })
  estadoOperacional: EstadoOperacionalActivo;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => OrdenTrabajo, (orden) => orden.activo)
  ordenesTrabajo: OrdenTrabajo[];

  @BeforeInsert()
  generarIdentificadores(): void {
    if (!this.uuidActivo) {
      this.uuidActivo = uuidv4();
    }
    if (!this.codigoQrToken) {
      this.codigoQrToken = uuidv4().replace(/-/g, '');
    }
  }
}
