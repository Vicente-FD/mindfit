import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import {
  Activo,
  AuditTrail,
  ComentarioOt,
  EvidenciaOt,
  OrdenTrabajo,
  Sucursal,
  Usuario,
} from '../entities';
import { AuditTrigger1730000000000 } from './migrations/1730000000000-AuditTrigger';

config({ path: '.env' });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? process.env.DB_DATABASE ?? 'mindfit_ops',
  entities: [
    Sucursal,
    Usuario,
    Activo,
    OrdenTrabajo,
    EvidenciaOt,
    ComentarioOt,
    AuditTrail,
  ],
  migrations: [AuditTrigger1730000000000],
  synchronize: false,
});
