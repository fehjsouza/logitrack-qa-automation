
const { test, expect } = require('@playwright/test');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const banco = path.resolve(
  __dirname,
  '../../../logitrack-avaliacao/data/logitrack.db'
);

function consultarSQL(sql) {
  const resultado = execFileSync(
    'sqlite3',
    ['-json', banco, sql],
    { encoding: 'utf8' }
  );

  return JSON.parse(resultado || '[]');
}

test('SQL: Deve validar total de embarques por status', async ({ request }) => {
  const reset = await request.post('/api/__reset');
  expect(reset.ok()).toBeTruthy();

  const status = consultarSQL(`
    SELECT status, COUNT(*) AS quantidade
    FROM shipments
    GROUP BY status
  `);

  const total = consultarSQL(`
    SELECT COUNT(*) AS quantidade
    FROM shipments
  `);

  const soma = status.reduce(
    (acumulado, item) => acumulado + item.quantidade,
    0
  );

  expect(status.length).toBeGreaterThan(0);
  expect(soma).toBe(total[0].quantidade);
});
