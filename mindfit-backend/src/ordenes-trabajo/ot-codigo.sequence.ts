/** Sincroniza la secuencia PostgreSQL con el máximo correlativo ya usado en codigo_ot. */
export async function syncOtCaseSequence(
  query: (sql: string, params?: unknown[]) => Promise<unknown>,
): Promise<void> {
  await query(`CREATE SEQUENCE IF NOT EXISTS ot_case_number_seq START 1`);
  await query(`
    SELECT setval(
      'ot_case_number_seq',
      COALESCE((
        SELECT MAX((regexp_match(codigo_ot, '^OT-[0-9]+-([0-9]+)$'))[1]::int)
        FROM ordenes_trabajo
      ), 0),
      true
    )
  `);
}

export async function nextOtCodigo(
  query: (sql: string, params?: unknown[]) => Promise<unknown>,
): Promise<string> {
  await syncOtCaseSequence(query);
  const rows = (await query(
    `SELECT nextval('ot_case_number_seq')::int AS n`,
  )) as { n: number }[];
  const year = new Date().getFullYear();
  const seq = Number(rows[0]?.n ?? 1);
  return `OT-${year}-${String(seq).padStart(5, '0')}`;
}
