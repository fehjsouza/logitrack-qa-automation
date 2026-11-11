
const { test, expect } = require('@playwright/test');

test.describe('E2E - Autenticação LogiTrack', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login');
  });

  test('Deve exibir os campos da tela de login', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Entrar no LogiTrack' })
    ).toBeVisible();

    await expect(page.getByLabel('E-mail')).toBeVisible();
    await expect(page.getByLabel('Senha')).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Entrar' })
    ).toBeVisible();
  });

  test('Deve realizar login com credenciais válidas', async ({ page }) => {
    await page.getByLabel('E-mail')
      .fill('analista@logitrack.test');

    await page.getByLabel('Senha')
      .fill('Senha@123');

    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(
      page.getByRole('heading', { name: 'Entrar no LogiTrack' })
    ).toBeHidden();
  });


  test('Deve rejeitar login com senha incorreta', async ({ page }) => {
    await page.getByLabel('E-mail')
      .fill('analista@logitrack.test');

    await page.getByLabel('Senha')
      .fill('SenhaErrada123');

    await page.getByRole('button', { name: 'Entrar' }).click();

    // O usuário deve permanecer na tela de login.
    await expect(
      page.getByRole('heading', { name: 'Entrar no LogiTrack' })
    ).toBeVisible();
  });

  
  test('Deve realizar logout com sucesso', async ({ page }) => {
   await page.getByLabel('E-mail')
    .fill('analista@logitrack.test');

  await page.getByLabel('Senha')
    .fill('Senha@123');

  await page.getByRole('button', { name: 'Entrar' })
    .click();

  await expect(page).toHaveURL(/#\/shipments/);

  // Aguarda o botão de logout
  const sair = page.getByText('Sair', { exact: true });
  await expect(sair).toBeVisible();

  await sair.click();

  // Verifica se o logout redirecionou para login
  await expect(page).toHaveURL(/#\/login/);

  await expect(
    page.getByLabel('E-mail')
  ).toBeVisible();
});

});
