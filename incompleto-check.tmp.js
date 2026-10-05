require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

const c = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

(async () => {
  await c.connect();

  // 1. Hay items de orden con MAS de una evaluacion de bodega?
  const dup = await c.query(`
    SELECT purchase_order_item_id, COUNT(*) AS n,
           array_agg(estado_completitud ORDER BY fecha_ingreso NULLS LAST) AS estados
      FROM public.bodega_evaluations
     GROUP BY purchase_order_item_id
    HAVING COUNT(*) > 1
     ORDER BY n DESC
     LIMIT 10;
  `);
  console.log('items con >1 evaluacion:', dup.rows.length);
  dup.rows.forEach((r) => console.log(' ', r.purchase_order_item_id, 'n=' + r.n, JSON.stringify(r.estados)));

  // 2. Como se ven los Incompleto revisado=false (los que el user quiere poder editar)
  const inc = await c.query(`
    SELECT estado_completitud, revisado, ingreso_aprobado, COUNT(*) AS total
      FROM public.bodega_evaluations
     WHERE estado_completitud = 'Incompleto'
     GROUP BY 1,2,3 ORDER BY 2,3;
  `);
  console.log('--- Incompleto por revisado/ingreso_aprobado ---');
  inc.rows.forEach((r) => console.log(JSON.stringify(r)));

  // 3. Prueba real: Incompleto -> Pendiente, TODO dentro de una transaccion
  const target = await c.query(`
    SELECT id, estado_completitud, revisado
      FROM public.bodega_evaluations
     WHERE estado_completitud = 'Incompleto'
     ORDER BY fecha_ingreso DESC NULLS LAST
     LIMIT 1;
  `);
  const t = target.rows[0];
  console.log('--- fila de prueba ---');
  console.log('antes:', JSON.stringify(t));

  await c.query('BEGIN');
  try {
    for (const destino of ['Pendiente', 'Completo', 'Incompleto']) {
      const r = await c.query(
        `UPDATE public.bodega_evaluations
            SET estado_completitud = $2, revisado = $3
          WHERE id = $1
          RETURNING estado_completitud, revisado`,
        [t.id, destino, destino === 'Pendiente' ? false : true],
      );
      console.log(`  Incompleto -> ${destino}: OK`, JSON.stringify(r.rows[0]));
    }
  } catch (e) {
    console.error('  PRUEBA FALLO:', e.message);
    await c.query('ROLLBACK');
    await c.end();
    process.exit(1);
  }
  await c.query('ROLLBACK');

  const after = await c.query(
    `SELECT id, estado_completitud, revisado FROM public.bodega_evaluations WHERE id = $1`,
    [t.id],
  );
  console.log('despues de rollback:', JSON.stringify(after.rows[0]));

  const dist = await c.query(`
    SELECT estado_completitud, revisado, COUNT(*) AS total
      FROM public.bodega_evaluations GROUP BY 1,2 ORDER BY 1,2;
  `);
  console.log('--- distribucion final ---');
  dist.rows.forEach((r) => console.log(JSON.stringify(r)));

  await c.end();
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
