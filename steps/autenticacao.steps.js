const { expect } = require('@playwright/test');
const { createBdd } = require('playwright-bdd');
const { test } = require('./fixtures');

const { Given, When, Then } = createBdd(test);

const BASE_URL = 'http://127.0.0.1:3000';

// CENÁRIO 1
Given('que tenho credenciais válidas de analista', async ({ scenarioContext }) => {
  scenarioContext.email = 'analista@logitrack.test';
  scenarioContext.password = 'Senha@123';
});

When('envio as credenciais para o endpoint de login', async ({ request, scenarioContext }) => {
  scenarioContext.response = await request.post(`${BASE_URL}/api/auth/login`, {
    data: {
      email: scenarioContext.email,
      password: scenarioContext.password,
    },
  });
});

Then('devo receber HTTP 200 e um token de autenticação', async ({ scenarioContext }) => {
  expect(scenarioContext.response.status()).toBe(200);

  const body = await scenarioContext.response.json();

  expect(body.token).toBeTruthy();
  expect(body.user.email).toBe('analista@logitrack.test');
  expect(body.user.role).toBe('analista');
});

// CENÁRIO 2
Given('que tenho credenciais de analista com senha incorreta', async ({ scenarioContext }) => {
  scenarioContext.email = 'analista@logitrack.test';
  scenarioContext.password = 'SenhaErrada';
});

When('tento autenticar na API', async ({ request, scenarioContext }) => {
  scenarioContext.response = await request.post(`${BASE_URL}/api/auth/login`, {
    data: {
      email: scenarioContext.email,
      password: scenarioContext.password,
    },
  });
});

Then('devo receber HTTP 401', async ({ scenarioContext }) => {
  expect(scenarioContext.response.status()).toBe(401);
});

// CENÁRIO 3
Given('que informo apenas o email no login', async ({ scenarioContext }) => {
  scenarioContext.email = 'analista@logitrack.test';
});

When('envio a requisição de autenticação', async ({ request, scenarioContext }) => {
  scenarioContext.response = await request.post(`${BASE_URL}/api/auth/login`, {
    data: {
      email: scenarioContext.email,
    },
  });
});

Then('devo receber HTTP 400', async ({ scenarioContext }) => {
  expect(scenarioContext.response.status()).toBe(400);
});

// CENÁRIO 4 - BUG-001
Given('que realizo login para verificar dados sensíveis', async ({ scenarioContext }) => {
  test.fail(true, 'BUG-001: API expõe passwordHash na resposta de login');

  scenarioContext.email = 'analista@logitrack.test';
  scenarioContext.password = 'Senha@123';
});

Then('a resposta não deve conter o campo passwordHash', async ({ scenarioContext }) => {
  const body = await scenarioContext.response.json();

  expect(body.user).not.toHaveProperty('passwordHash');
});

// CENÁRIO 5
Given('que não possuo token de autenticação', async ({}) => {
  // Não enviaremos o cabeçalho Authorization.
});

When('consulto a lista de embarques sem token', async ({ request, scenarioContext }) => {
  scenarioContext.response = await request.get(`${BASE_URL}/api/shipments`);
});

// CENÁRIO 6 - BUG-002
Given('que possuo um token inválido', async ({ scenarioContext }) => {
  test.fail(true, 'BUG-002: API retorna HTTP 500 em vez de 401 para token inválido');
  scenarioContext.token = 'token-invalido';
});

When('consulto a lista de embarques com token inválido', async ({ request, scenarioContext }) => {
  scenarioContext.response = await request.get(`${BASE_URL}/api/shipments`, {
    headers: {
      Authorization: `Bearer ${scenarioContext.token}`,
    },
  });
});
