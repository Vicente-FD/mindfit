import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('licencias_tecnicos')
export class LicenciaTecnico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tecnico_id', type: 'int', unique: true })
  tecnicoId: number;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tecnico_id' })
  tecnico: Usuario;

  @Column({ name: 'tipo_licencia', type: 'varchar', length: 30 })
  tipoLicencia: string;

  @Column({ name: 'fecha_vencimiento', type: 'date' })
  fechaVencimiento: string;

  @Column({ name: 'documento_url', type: 'text', nullable: true })
  documentoUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
