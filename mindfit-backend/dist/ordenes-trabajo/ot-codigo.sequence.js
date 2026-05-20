"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncOtCaseSequence = syncOtCaseSequence;
exports.nextOtCodigo = nextOtCodigo;
async function syncOtCaseSequence(query) {
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
async function nextOtCodigo(query) {
    await syncOtCaseSequence(query);
    const rows = (await query(`SELECT nextval('ot_case_number_seq')::int AS n`));
    const year = new Date().getFullYear();
    const seq = Number(rows[0]?.n ?? 1);
    return `OT-${year}-${String(seq).padStart(5, '0')}`;
}
//# sourceMappingURL=ot-codigo.sequence.js.map