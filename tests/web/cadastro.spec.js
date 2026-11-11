
const { test, expect } = require('@playwright/test');

test.describe('E2E - Cadastro de embarques', () => {

  test.beforeEach(async ({ page, request }) => {
    await request.post('/api/__reset');

    await page.goto('/#/login');

    await page.getByLabel('E-mail')
      .fill('analista@logitrack.test');

    await page.getByLabel('Senha')
      .fill('Senha@123');

    await page.getByRole('button', { name: 'Entrar' })
      .click();

    await expect(page).toHaveURL(/#\/shipments/);

    await page.goto('/#/shipments/new');

    await expect(
      page.getByRole('heading', { name: 'Novo embarque' })
    ).toBeVisible();
  });

  async function preencherFormulario(page, referencia) {
    await page.getByLabel('Referência').fill(referencia);
    await page.getByLabel('Cliente').fill('Empresa QA Automação');
    await page.getByLabel('Origem').fill('Santos');
    await page.getByLabel('Destino').fill('Hamburgo');
    await page.getByLabel('Incoterm').selectOption('FOB');
    await page.getByLabel('Peso (kg)').fill('1500');
    await page.getByLabel('Valor (USD)').fill('12500');
  }

  test('Deve cadastrar um embarque válido', async ({ page }) => {
    const referencia = 'LT-2026-0901';

    await preencherFormulario(page, referencia);

    await page.getByRole('button', { name: 'Salvar embarque' })
      .click();

    await expect(page).toHaveURL(/#\/shipments/);

    await page.getByPlaceholder('Buscar por referência ou cliente')
      .fill(referencia);

    await page.getByRole('button', { name: 'Filtrar' })
      .click();

    await expect(
      page.locator('tbody tr').filter({ hasText: referencia })
    ).toBeVisible();
  });

  test('Não deve permitir cadastro com campos vazios', async ({ page }) => {
    await page.getByRole('button', { name: 'Salvar embarque' })
      .click();

    // O formulário deve impedir o cadastro
    await expect(page).toHaveURL(/#\/shipments\/new/);

    await expect(
      page.getByRole('heading', { name: 'Novo embarque' })
    ).toBeVisible();
  });

  test('Deve integrar cadastro Web com consulta API', async ({ page, request }) => {
    const referencia = 'LT-2026-0902';

    await preencherFormulario(page, referencia);

    await page.getByRole('button', { name: 'Salvar embarque' })
      .click();

    await expect(page).toHaveURL(/#\/shipments/);

    // Autenticação na API
    const login = await request.post('/api/auth/login', {
      data: {
        email: 'analista@logitrack.test',
        password: 'Senha@123'
      }
    });

    expect(login.ok()).toBeTruthy();

    const loginBody = await login.json();
    const token = loginBody.token;

    expect(token).toBeTruthy();

    // Consulta o embarque criado pela interface
    const resposta = await request.get('/api/shipments', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        q: referencia
      }
    });

    expect(resposta.status()).toBe(200);

    const body = await resposta.json();

    // Busca a referência no retorno da API
    expect(JSON.stringify(body)).toContain(referencia);
  });

});
