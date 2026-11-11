# LogiTrack — Relatório de defeitos e análise de dados

**Responsável:** Luiz Felipe de Jesus Souza  
**Ambiente:** aplicação local em `http://127.0.0.1:3000`, macOS, Playwright e SQLite  
**Situação:** quatro defeitos reproduzidos pela automação e seis registros com inconsistências identificados por SQL. Correções da aplicação não foram realizadas neste trabalho.

## 1. Escopo e evidências

Foram avaliados autenticação, controle de acesso, cadastro e listagem de embarques, apresentação de datas e integridade dos dados. Este documento utiliza as saídas de execução compartilhadas durante a avaliação. Não atribui causa técnica aos problemas sem investigação do código.

A execução compartilhada da suíte de 19 cenários apresentou 15 aprovações normais e quatro falhas esperadas. O teste SQL adicional passou isoladamente; posteriormente, a execução completa foi informada como bem-sucedida pelo responsável, sem transcrição do resumo final neste documento.

Os quatro cenários de defeitos utilizam marcação de falha esperada (`test.fail()` ou sua configuração equivalente no BDD). Assim, `passed` no resumo da execução não significa que esses defeitos foram corrigidos. É necessário verificar a asserção que falhou em cada cenário: uma falha de infraestrutura não comprova o defeito de negócio.

**Relatório HTML:** `evidencias/relatorio-html`, consultável com:

```bash
npx playwright show-report evidencias/relatorio-html
```

Screenshots, vídeos e traces não foram anexados a este documento. Sua disponibilidade deve ser verificada no relatório gerado, conforme a configuração do projeto.

## 2. Resumo dos defeitos

Severidades e prioridades são propostas para triagem, considerando o impacto observado no ambiente de avaliação.

| ID | Defeito | Severidade proposta | Prioridade proposta |
|---|---|---|---|
| BUG-001 | Resposta de login expõe `passwordHash` | Alta | Alta |
| BUG-002 | Token inválido resulta em HTTP 500 | Média | Alta |
| BUG-003 | Cadastro pela API não preserva os centavos do valor USD retornado | Média | Alta |
| BUG-004 | Interface apresenta datas fora do formato brasileiro esperado | Baixa | Média |

## 3. Defeitos detalhados

### BUG-001 — Exposição do hash da senha na resposta de login

**Situação:** reproduzido; falha esperada na automação.  
**Camada:** API.  
**Teste:** `tests/api/auth.spec.js` — `BUG-001: Não deve expor o hash da senha na resposta`.

**Pré-condições:** aplicação em execução e usuário de teste disponível.

**Passos para reprodução:**

1. Enviar `POST /api/auth/login` com as credenciais da massa de avaliação:

   ```json
   { "email": "analista@logitrack.test", "password": "Senha@123" }
   ```

2. Confirmar HTTP 200.
3. Inspecionar as propriedades de `user` no JSON retornado.

**Resultado esperado:** autenticação bem-sucedida, com token e dados públicos do usuário, sem `passwordHash`.

**Resultado obtido:** presença de `passwordHash` na resposta, conforme o defeito registrado e a falha esperada do cenário.

**Impacto:** exposição desnecessária de dado sensível de autenticação ao consumidor da API. Não foi demonstrado comprometimento de senha nem acesso indevido a outras contas.

**Critério de reteste:** manter login válido com HTTP 200 e verificar que `user` não contém `passwordHash` nem campos equivalentes de senha. Remover a marcação de falha esperada após confirmar a correção.

### BUG-002 — Token inválido retorna HTTP 500

**Situação:** reproduzido; falha esperada na automação.  
**Camada:** API.  
**Teste:** `tests/api/auth.spec.js` — `BUG-002: Deve bloquear acesso com token inválido`.

**Pré-condição:** aplicação em execução.

**Passos para reprodução:**

1. Enviar `GET /api/shipments`.
2. Incluir o cabeçalho `Authorization: Bearer token-invalido`.
3. Verificar o status HTTP da resposta.

**Resultado esperado:** HTTP 401, rejeitando a credencial inválida.

**Resultado obtido:** HTTP 500, conforme o defeito registrado.

**Impacto:** tratamento inadequado de credencial inválida, apresentado ao consumidor como erro interno. Não foi demonstrado acesso aos embarques com esse token.

**Critério de reteste:** token inválido deve retornar HTTP 401; acesso sem token deve continuar retornando HTTP 401; token válido deve continuar permitindo acesso autorizado.

### BUG-003 — Resposta do cadastro não preserva centavos

**Situação:** reproduzido pelo cenário BDD com falha esperada.  
**Camada:** API de embarques.  
**Referência:** `features/embarques.feature` — `Cadastrar embarque preservando os centavos @bug-003`.

**Pré-condições:** autenticação válida e referência de embarque ainda não utilizada.

**Passos para reprodução:**

1. Utilizar o payload válido definido no cenário BDD de cadastro de embarques.
2. Informar `value_usd` com parte decimal não nula.
3. Enviar a requisição de cadastro autenticada para `/api/shipments`.
4. Comparar o valor enviado com o valor retornado pela API.

**Resultado esperado:** preservar o valor monetário informado, incluindo os centavos.

**Resultado obtido:** o valor retornado apresenta arredondamento que não preserva os centavos, conforme o defeito registrado no cenário.

**Impacto:** divergência no valor monetário apresentado ao consumidor da API.

**Limite da evidência:** a saída de execução compartilhada não contém o payload nem o par numérico esperado/obtido. Esses valores devem ser consultados na asserção do cenário e no relatório HTML. Não há evidência suficiente neste documento para afirmar que o valor persistido no banco também foi alterado.

**Critério de reteste:** executar o cenário com valor fracionário e confirmar sua preservação na resposta. Complementar a investigação comparando o valor persistido e o retornado pela consulta do embarque.

### BUG-004 — Datas exibidas fora do formato brasileiro

**Situação:** reproduzido; falha esperada na automação.  
**Camada:** interface Web, listagem de embarques.  
**Teste:** `tests/web/embarques.spec.js` — `BUG-004: Deve exibir datas no formato brasileiro`.

**Pré-condições:** usuário autenticado e embarques disponíveis para consulta.

**Passos para reprodução:**

1. Acessar a aplicação e realizar login.
2. Abrir a listagem de embarques.
3. Observar as datas verificadas pelo teste e comparar sua apresentação com `DD/MM/AAAA`.

**Resultado esperado:** datas apresentadas no formato brasileiro `DD/MM/AAAA`.

**Resultado obtido:** datas apresentadas no formato americano, conforme o defeito registrado.

**Impacto:** ambiguidade na leitura de dia e mês pelo usuário brasileiro.

**Limite da evidência:** a data literal exibida e a captura de tela não constam na saída de terminal compartilhada. Consultar o relatório HTML para complementar a evidência visual.

**Critério de reteste:** confirmar formato brasileiro, preferencialmente com uma data cujo dia seja superior a 12 para facilitar a distinção entre dia e mês.

## 4. Inconsistências identificadas por SQL

**Banco consultado:** `logitrack-avaliacao/data/logitrack.db`.  
**Consultas:** `sql/validacoes.sql`.

Os achados abaixo descrevem o estado da massa consultada. Não comprovam, isoladamente, que os mesmos dados possam ser criados pelos fluxos atuais da aplicação. A origem dos registros não foi determinada; podem pertencer à massa intencional da avaliação.

### 4.1 Status atual diferente do último evento

A consulta identifica o último evento por `created_at DESC, id DESC` e compara `to_status` com `shipments.status`.

| ID de análise | Embarque | Status em `shipments` | Último `to_status` |
|---|---|---|---|
| SQL-001 | LT-2026-0007 | DELIVERED | IN_TRANSIT |
| SQL-002 | LT-2026-0014 | CANCELLED | DELIVERED |
| SQL-003 | LT-2026-0022 | IN_TRANSIT | CREATED |

**Expectativa avaliada:** o último evento deve representar o status atual do embarque, caso toda alteração de status exija registro de evento.

**Impacto potencial:** histórico e situação atual podem fornecer informações conflitantes.

**Próxima investigação:** confirmar a regra de histórico e reproduzir transições pela API, verificando o embarque e seus eventos após cada alteração. Não atribuir o problema a uma falha de transação sem essa verificação.

### 4.2 Registros incompatíveis com as regras avaliadas

| ID de análise | Embarque | Dado observado | Expectativa avaliada |
|---|---|---|---|
| SQL-004 | LT-2026-0011 | Origem e destino: Paranaguá, BR | Origem e destino diferentes |
| SQL-005 | LT-2026-0019 | `weight_kg = 0.0` | Peso maior que zero |
| SQL-006 | LT-2026-0025 | `value_usd = -150.0` | Valor maior que zero |

**Impacto potencial:** dados inválidos podem comprometer informações operacionais e totais financeiros.

**Próxima investigação:** confirmar as regras de aceitação e tentar cadastrar os mesmos tipos de valores inválidos pela API e pela interface. Diferenciar inconsistência preexistente da massa de falha atual de validação.

### 4.3 Distribuição da massa consultada

| Status | Quantidade |
|---|---:|
| CANCELLED | 6 |
| CREATED | 6 |
| CUSTOMS | 5 |
| DELIVERED | 5 |
| IN_TRANSIT | 5 |
| **Total** | **27** |

Essa contagem corresponde ao momento da consulta compartilhada. Reset e novos cadastros podem alterar a massa; ela não deve ser tratada como valor fixo de todas as execuções.

## 5. Validação automatizada SQL

**Arquivo:** `tests/api/sql.spec.js`.  
**Cenário:** `SQL: Deve validar total de embarques por status`.  
**Resultado compartilhado:** `1 passed (1.4s)`.

O teste solicita reset pela API, executa consultas no SQLite e compara a soma das quantidades agrupadas por status com a contagem total da tabela. Essa verificação confirma a igualdade entre as contagens, mas não valida os valores dos status, as regras de negócio nem a integridade do histórico. Portanto, sua aprovação é compatível com os seis achados SQL descritos acima.

## 6. Reprodução das verificações

Com a aplicação iniciada, executar na raiz do projeto de automação:

```bash
npx bddgen
npx playwright test
npx playwright show-report evidencias/relatorio-html
```

Para executar as consultas SQL sem alterar dados:

```bash
sqlite3 -header -column ../logitrack-avaliacao/data/logitrack.db < sql/validacoes.sql
```

O teste automatizado SQL utiliza `/api/__reset`, que restaura a massa da aplicação. Executá-lo somente no ambiente local de avaliação. As consultas de análise utilizam `SELECT`.

## 7. Recomendações para a entrega e o reteste

1. Incluir este documento na pasta `docs` e referenciá-lo no README.
2. Disponibilizar o relatório HTML da execução final, conferindo as asserções dos quatro defeitos esperados.
3. Complementar BUG-003 com os valores exatos enviado e retornado e BUG-004 com a data exibida ou captura correspondente.
4. Após cada correção, remover a marcação de falha esperada do cenário afetado e executar o reteste e a regressão pertinente.
5. Manter os achados SQL separados dos defeitos funcionais até confirmar sua origem e reprodução nos fluxos da aplicação.
