
# language: pt

Funcionalidade: Autenticação na API LogiTrack
  Como usuário da LogiTrack
  Quero realizar autenticação na API
  Para acessar os recursos conforme minhas permissões

  Cenário: Login com credenciais válidas
    Dado que tenho credenciais válidas de analista
    Quando envio as credenciais para o endpoint de login
    Então devo receber HTTP 200 e um token de autenticação

  Cenário: Login com senha incorreta
    Dado que tenho credenciais de analista com senha incorreta
    Quando tento autenticar na API
    Então devo receber HTTP 401

  Cenário: Login sem todos os campos obrigatórios
    Dado que informo apenas o email no login
    Quando envio a requisição de autenticação
    Então devo receber HTTP 400

  @bug-001
  Cenário: Resposta de login não deve expor o hash da senha
    Dado que realizo login para verificar dados sensíveis
    Quando envio as credenciais para o endpoint de login
    Então a resposta não deve conter o campo passwordHash

  Cenário: Acesso sem token de autenticação
    Dado que não possuo token de autenticação
    Quando consulto a lista de embarques sem token
    Então devo receber HTTP 401

  @bug-002
  Cenário: Acesso com token inválido
    Dado que possuo um token inválido
    Quando consulto a lista de embarques com token inválido
    Então devo receber HTTP 401
