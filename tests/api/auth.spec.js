
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://127.0.0.1:3000';

test.describe('API - Autenticação', () => {

  test('Deve realizar login com credenciais válidas', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: 'analista@logitrack.test',
        password: 'Senha@123'
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.token).toBeTruthy();
    expect(body.user.email).toBe('analista@logitrack.test');
    expect(body.user.role).toBe('analista');
  });

  test('Deve rejeitar login com senha incorreta', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: 'analista@logitrack.test',
        password: 'SenhaErrada'
      }
    });

    expect(response.status()).toBe(401);
  });

  test('Deve rejeitar login sem os campos obrigatórios', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: 'analista@logitrack.test'
      }
    });

    expect(response.status()).toBe(400);
  });

  test('BUG-001: Não deve expor o hash da senha na resposta', async ({ request }) => {
    test.fail(true, 'BUG-001: API expõe passwordHash na resposta de login');

    const response = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: 'analista@logitrack.test',
        password: 'Senha@123'
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.user).not.toHaveProperty('passwordHash');
  });

  test('Deve bloquear acesso sem token', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/shipments`);

    expect(response.status()).toBe(401);
  });

  test('BUG-002: Deve bloquear acesso com token inválido', async ({ request }) => {
    test.fail(true, 'BUG-002: Token inválido retorna HTTP 500 em vez de 401');

    const response = await request.get(`${BASE_URL}/api/shipments`, {
      headers: {
        Authorization: 'Bearer token-invalido'
      }
    });

    expect(response.status()).toBe(401);
  });

});
