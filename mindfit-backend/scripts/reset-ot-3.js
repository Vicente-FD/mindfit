const { Client } = require('pg');

async function main() {
  const c = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'mindfitpass123',
    database: 'mindfit_ops',
  });
  await c.connect();
  const r = await c.query(
    "UPDATE ordenes_trabajo SET estado='asignada', fecha_inicio_real=NULL WHERE id=3 RETURNING id, codigo_ot, estado",
  );
  console.log(r.rows);
  await c.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
