
const { test, expect } = require('@playwright/test');

test.describe('E2E - Listagem de embarques', () => {

  test.beforeEach(async ({ page, request }) => {
    // Restaura os dados iniciais
    await request.post('/api/__reset');

    // Abre a tela de login
    await page.goto('/#/login');

    // Realiza autenticação
    await page.getByLabel('E-mail')
      .fill('analista@logitrack.test');

    await page.getByLabel('Senha')
      .fill('Senha@123');

    await page.getByRole('button', { name: 'Entrar' })
      .click();

    // Confirma acesso à listagem
    await expect(page).toHaveURL(/#\/shipments/);
  });

  test('Deve exibir a listagem de embarques', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Embarques' })
    ).toBeVisible();

    await expect(
      page.locator('thead').getByText('Referência')
    ).toBeVisible();

    await expect(
      page.locator('thead').getByText('Cliente')
    ).toBeVisible();

    await expect(
      page.locator('tbody tr')
        .filter({ hasText: 'LT-2026-0027' })
    ).toBeVisible();
  });

  test('Deve buscar embarque pela referência', async ({ page }) => {
    await page.getByPlaceholder(
      'Buscar por referência ou cliente'
    ).fill('LT-2026-0027');

    await page.getByRole('button', { name: 'Filtrar' })
      .click();

    await expect(
      page.locator('tbody tr')
        .filter({ hasText: 'LT-2026-0027' })
    ).toBeVisible();

    await expect(
      page.locator('tbody tr')
    ).toHaveCount(1);
  });

  test('Deve filtrar embarques pelo status', async ({ page }) => {
    await page.getByLabel('Status')
      .selectOption('CREATED');

    await page.getByRole('button', { name: 'Filtrar' })
      .click();

    const linhas = page.locator('tbody tr');

    await expect(linhas.first()).toBeVisible();

    const quantidade = await linhas.count();

    for (let i = 0; i < quantidade; i++) {
      await expect(linhas.nth(i))
        .toContainText('Criado');
    }
  });

  test('Deve navegar entre as páginas', async ({ page }) => {
    await expect(
      page.getByText('Página 1 de 3')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Próxima' })
      .click();

    await expect(
      page.getByText('Página 2 de 3')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Anterior' })
      .click();

    await expect(
      page.getByText('Página 1 de 3')
    ).toBeVisible();
  });

  test('BUG-004: Deve exibir datas no formato brasileiro', async ({ page }) => {
    // Falha esperada devido ao defeito conhecido
    test.fail(true, 'BUG-004: Data exibida no formato americano');

    const embarque = page.locator('tbody tr')
      .filter({ hasText: 'LT-2026-0027' });

    await expect(embarque).toBeVisible();

    // Data esperada: DD/MM/AAAA
    await expect(embarque)
      .toContainText('24/03/2026');
  });

});
