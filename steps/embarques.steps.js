
const { expect } = require('@playwright/test');
const { createBdd } = require('playwright-bdd');
const { test } = require('./fixtures');

const { Given, When, Then } = createBdd(test);

const BASE_URL = 'http://127.0.0.1:3000';

// PREPARAÇÃO DOS DADOS
Given('que possuo dados válidos para um novo embarque', async ({ request, scenarioContext }) => {

  // Restaura a massa inicial para evitar dados de testes anteriores.
  await request.post(`${BASE_URL}/api/__reset`);

  // Realiza login para obter o token de autenticação.
  const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
    data: {
      email: 'analista@logitrack.test',
      password: 'Senha@123',
    },
  });

  const loginBody = await loginResponse.json();
  scenarioContext.token = loginBody.token;

  // Dados que serão utilizados no cadastro.
  scenarioContext.shipment = {
    reference: 'LT-2026-0100',
    customer: 'Empresa Teste QA',
    origin: 'Santos',
    destination: 'Hamburgo',
    incoterm: 'FOB',
    weightKg: 1500.5,
    valueUsd: 12500.75,
  };
});

// EXECUÇÃO DA REQUISIÇÃO
When('envio a requisição de cadastro de embarque', async ({ request, scenarioContext }) => {

  scenarioContext.response = await request.post(`${BASE_URL}/api/shipments`, {
    headers: {
      Authorization: `Bearer ${scenarioContext.token}`,
    },
    data: scenarioContext.shipment,
  });
});

// VALIDAÇÃO DA RESPOSTA
Then('devo receber HTTP 201 com o embarque criado', async ({ scenarioContext }) => {

  test.fail(true, 'BUG-003: API arredonda o valor USD e perde os centavos');

  expect(scenarioContext.response.status()).toBe(201);

  const body = await scenarioContext.response.json();

  expect(body.id).toBeTruthy();
  expect(body.reference).toBe('LT-2026-0100');
  expect(body.customer).toBe('Empresa Teste QA');
  expect(body.status).toBe('CREATED');
  expect(body.valueUsd).toBe(scenarioContext.shipment.valueUsd);
});