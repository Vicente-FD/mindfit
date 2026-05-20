import { Module, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuditTrigger1730000000000 } from './migrations/1730000000000-AuditTrigger';

@Module({})
export class DatabaseModule implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    const migration = new AuditTrigger1730000000000();
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await migration.up(queryRunner);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('already exists')) {
        throw error;
      }
    } finally {
      await queryRunner.release();
    }
  }
}
