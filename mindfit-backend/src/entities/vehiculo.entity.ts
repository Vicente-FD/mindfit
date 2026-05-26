import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Sucursal } from './sucursal.entity';
import { Usuario } from './usuario.entity';

@Entity('vehiculos')
export class Vehiculo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 15, unique: true })
  patente: string;

  @Column({ type: 'varchar', length: 100 })
  marca: string;

  @Column({ type: 'varchar', length: 100 })
  modelo: string;

  @Column({ type: 'int' })
  anio: number;

  @Column({ name: 'kilometraje_actual', type: 'int', default: 0 })
  kilometrajeActual: number;

  @Column({ name: 'siguiente_cambio_aceite_km', type: 'int', default: 0 })
  siguienteCambioAceiteKm: number;

  @Column({ name: 'sucursal_id', type: 'int', nullable: true })
  sucursalId: number | null;

  @ManyToOne(() => Sucursal, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sucursal_id' })
  sucursal: Sucursal | null;

  @Column({ name: 'conductor_id', type: 'int', nullable: true })
  conductorId: number | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'conductor_id' })
  conductor: Usuario | null;

  @Column({ name: 'vencimiento_soap', type: 'date' })
  vencimientoSoap: string;

  @Column({ name: 'vencimiento_permiso', type: 'date' })
  vencimientoPermiso: string;

  @Column({ name: 'vencimiento_revision', type: 'date' })
  vencimientoRevision: string;

  @Column({ name: 'documentos_urls', type: 'jsonb', nullable: true })
  documentosUrls: Record<string, string> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
