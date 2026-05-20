import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuditTrigger1730000000000 implements MigrationInterface {
  name = 'AuditTrigger1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_log_table_changes()
      RETURNS TRIGGER AS $$
      DECLARE
        v_user_id INTEGER;
        v_row_pk TEXT;
        v_old_data JSONB;
        v_new_data JSONB;
      BEGIN
        BEGIN
          v_user_id := NULLIF(current_setting('app.current_user_id', true), '')::INTEGER;
        EXCEPTION
          WHEN OTHERS THEN
            v_user_id := NULL;
        END;

        IF TG_OP = 'DELETE' THEN
          v_row_pk := OLD.id::TEXT;
          v_old_data := to_jsonb(OLD);
          v_new_data := NULL;
          INSERT INTO audit_trail (time_stamp, table_name, row_pk, operation, user_id, old_data, new_data)
          VALUES (NOW(), TG_TABLE_NAME, v_row_pk, 'DELETE', v_user_id, v_old_data, v_new_data);
          RETURN OLD;
        ELSIF TG_OP = 'UPDATE' THEN
          v_row_pk := NEW.id::TEXT;
          v_old_data := to_jsonb(OLD);
          v_new_data := to_jsonb(NEW);
          INSERT INTO audit_trail (time_stamp, table_name, row_pk, operation, user_id, old_data, new_data)
          VALUES (NOW(), TG_TABLE_NAME, v_row_pk, 'UPDATE', v_user_id, v_old_data, v_new_data);
          RETURN NEW;
        ELSIF TG_OP = 'INSERT' THEN
          v_row_pk := NEW.id::TEXT;
          v_old_data := NULL;
          v_new_data := to_jsonb(NEW);
          INSERT INTO audit_trail (time_stamp, table_name, row_pk, operation, user_id, old_data, new_data)
          VALUES (NOW(), TG_TABLE_NAME, v_row_pk, 'INSERT', v_user_id, v_old_data, v_new_data);
          RETURN NEW;
        END IF;

        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_audit_activos ON activos;
      CREATE TRIGGER trg_audit_activos
      AFTER INSERT OR UPDATE OR DELETE ON activos
      FOR EACH ROW EXECUTE FUNCTION fn_log_table_changes();
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_audit_ordenes_trabajo ON ordenes_trabajo;
      CREATE TRIGGER trg_audit_ordenes_trabajo
      AFTER INSERT OR UPDATE OR DELETE ON ordenes_trabajo
      FOR EACH ROW EXECUTE FUNCTION fn_log_table_changes();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_audit_ordenes_trabajo ON ordenes_trabajo;`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_audit_activos ON activos;`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_log_table_changes();`);
  }
}
