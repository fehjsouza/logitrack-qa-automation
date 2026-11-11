# LogiTrack — Automação de Testes QA

## 1. Objetivo

Projeto de automação de testes desenvolvido para avaliação técnica de QA, cobrindo funcionalidades da aplicação LogiTrack nas camadas de API, interface Web e banco de dados SQLite.

## 2. Tecnologias utilizadas

- JavaScript e Node.js 20
- Playwright Test 1.56.1
- Playwright-BDD e Gherkin
- SQLite
- Visual Studio Code
- Chromium

## 3. Estrutura do projeto

```text
logitrack-qa-automation/
├── features/
│   └── embarques.feature
├── steps/
│   ├── fixtures.js
│   ├── autenticacao.steps.js
│   └── embarques.steps.js
├── tests/
│   ├── api/
│   │   ├── auth.spec.js
│   │   └── sql.spec.js
│   └── web/
│       ├── login.spec.js
│       ├── embarques.spec.js
│       └── cadastro.spec.js
├── sql/
│   └── validacoes.sql
├── evidencias/
├── playwright.config.js
└── package.json
```

## 4. Estratégia de testes

A automação foi dividida em três camadas:

**API:** autenticação, validação de credenciais, controle de acesso e validação de regras de negócio.

**Web:** login, logout, listagem, pesquisa, filtros, paginação, cadastro de embarques e integração Web/API.

**Banco de dados:** consultas para contagem de embarques, totais por cliente, divergências de histórico e violações de regras de negócio.

Foi utilizado BDD para descrever um cenário de negócio em linguagem Gherkin.

## 5. Pré-requisitos

- Node.js 20
- npm
- SQLite3 disponível no terminal
- Aplicação LogiTrack instalada localmente
- Navegador Chromium instalado pelo Playwright

A estrutura local utilizada mantém as pastas `logitrack-avaliacao` e `logitrack-qa-automation` no mesmo diretório.

## 6. Como executar

### Iniciar a aplicação

No terminal da aplicação:

```bash
cd logitrack-avaliacao
npm start
```

A aplicação deve estar acessível em `http://127.0.0.1:3000`.

### Instalar as dependências da automação

No terminal do projeto de testes:

```bash
cd logitrack-qa-automation
npm install
npx playwright install chromium
```

### Executar todos os testes

```bash
npx bddgen
npx playwright test
```

### Executar testes por camada

```bash
npx playwright test --project=API
npx playwright test --project=WEB
npx playwright test --project=BDD
```

### Consultar o relatório HTML

```bash
npx playwright show-report evidencias/relatorio-html
```

### Executar as consultas SQL

```bash
sqlite3 -header -column ../logitrack-avaliacao/data/logitrack.db < sql/validacoes.sql
```

## 7. Defeitos identificados

| ID | Descrição | Comportamento esperado |
|---|---|---|
| BUG-001 | API expõe `passwordHash` na resposta de login | Não expor hash de senha |
| BUG-002 | Token inválido retorna HTTP 500 | Retornar HTTP 401 |
| BUG-003 | API arredonda o valor USD retornado | Preservar os centavos |
| BUG-004 | Interface apresenta data no formato americano | Exibir DD/MM/AAAA |

Os cenários associados a esses defeitos utilizam `test.fail()` para registrar falhas esperadas sem alterar as regras de aceitação.

## 8. Inconsistências identificadas no SQLite

Foram identificadas três divergências entre o status atual do embarque e seu último evento:

- LT-2026-0007
- LT-2026-0014
- LT-2026-0022

Também foram identificados três registros que violam regras de negócio:

- LT-2026-0011 — origem igual ao destino
- LT-2026-0019 — peso igual a zero
- LT-2026-0025 — valor USD negativo

Esses resultados foram obtidos por consultas SQL na massa de dados local. A origem das inconsistências não foi determinada.

## 9. Evidências e relatórios

O Playwright gera relatório HTML e, conforme a configuração, screenshots, vídeos e traces de falhas.

Os relatórios podem ser consultados pelo comando `npx playwright show-report`.

## 10. Uso de inteligência artificial

Foi utilizada inteligência artificial como ferramenta de apoio durante o desenvolvimento da solução, incluindo:

- Orientação na configuração do ambiente.
- Sugestões de cenários de teste.
- Apoio à implementação de automações com Playwright e BDD.
- Análise de erros de execução e ajustes de seletores.
- Apoio à elaboração de consultas SQL e documentação.

Os testes foram executados localmente, e os resultados observados foram utilizados para validar os cenários e identificar defeitos.

## 11. Limitações e melhorias futuras

A suíte atual cobre os principais fluxos de autenticação, listagem e cadastro, mas não representa cobertura integral da API.

Como evolução, recomenda-se ampliar os testes de CRUD, permissões administrativas, transições de status, histórico de eventos e limites dos campos, além de implementar execução contínua em CI.

O teste SQL utiliza o banco local da aplicação, portanto depende da estrutura de diretórios e da disponibilidade do SQLite3 no ambiente de execução.
