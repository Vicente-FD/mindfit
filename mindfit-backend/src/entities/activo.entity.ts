import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
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
import { Marca } from './marca.entity';
import { Categoria } from './categoria.entity';
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

  @Column({
    name: 'codigo_qr_token',
    type: 'varchar',
    length: 32,
    unique: true,
    nullable: true,
  })
  codigoQrToken: string | null;

  @Column({
    name: 'codigo_inventario',
    type: 'varchar',
    length: 32,
    unique: true,
    nullable: true,
  })
  codigoInventario: string | null;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({ name: 'marca_id', type: 'int', nullable: true })
  marcaId: number | null;

  @ManyToOne(() => Marca, (marca) => marca.activos, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'marca_id' })
  marcaRelacion: Marca | null;

  /** Denormalizado para consultas rápidas y compatibilidad */
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

  @Column({ type: 'enum', enum: CategoriaActivo, nullable: true })
  categoria: CategoriaActivo | null;

  @Column({ name: 'categoria_id', type: 'int', nullable: true })
  categoriaId: number | null;

  @ManyToOne(() => Categoria, (cat) => cat.activos, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoria_id' })
  categoriaRelacion: Categoria | null;

  @Column({ name: 'piso_asignado', type: 'int', nullable: true })
  pisoAsignado: number | null;

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

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToMany(() => OrdenTrabajo, (orden) => orden.activo)
  ordenesTrabajo: OrdenTrabajo[];

  @BeforeInsert()
  generarUuid(): void {
    if (!this.uuidActivo) {
      this.uuidActivo = uuidv4();
    }
  }
}
