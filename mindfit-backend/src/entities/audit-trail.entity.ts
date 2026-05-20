import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OperacionAuditoria } from '../common/enums';
import { Usuario } from './usuario.entity';

@Entity('audit_trail')
export class AuditTrail {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'time_stamp', type: 'timestamptz', default: () => 'NOW()' })
  timeStamp: Date;

  @Column({ name: 'table_name', type: 'varchar', length: 100 })
  tableName: string;

  @Column({ name: 'row_pk', type: 'varchar', length: 100 })
  rowPk: string;

  @Column({ type: 'enum', enum: OperacionAuditoria })
  operation: OperacionAuditoria;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  @ManyToOne(() => Usuario, (usuario) => usuario.auditorias, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  usuario: Usuario | null;

  @Column({ name: 'old_data', type: 'jsonb', nullable: true })
  oldData: Record<string, unknown> | null;

  @Column({ name: 'new_data', type: 'jsonb', nullable: true })
  newData: Record<string, unknown> | null;
}
