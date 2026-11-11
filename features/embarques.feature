
# language: pt

Funcionalidade: Cadastro de embarques na API LogiTrack
  Como usuário autenticado
  Quero cadastrar um embarque
  Para registrar uma nova operação logística

  @bug-003
  Cenário: Cadastrar embarque preservando os centavos
    Dado que possuo dados válidos para um novo embarque
    Quando envio a requisição de cadastro de embarque
    Então devo receber HTTP 201 com o embarque criado
