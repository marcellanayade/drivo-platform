import 'fastify'

// avisa que preHandler "precisaEstarLogado" existe pra evitar erro do ts c
declare module 'fastify' {
  interface FastifyRequest {
    usuarioId: string
  }
}

// formato dos dados do veiculo que chegam do form
export type DadosDoVeiculo = {
  placa?: string
  renavam?: string
  chassi?: string
  marca?: string
  modelo?: string
  anoFabricacao?: number | string
  anoModelo?: number | string
  cor?: string
  combustivel?: string
  tipo?: string
  apelido?: string
  fotoUrl?: string
}

// retorno do gemini depois de ler o CRLV
export type DadosDoCrlv = {
  placa?: string
  renavam?: string
  chassi?: string
  marca?: string
  modelo?: string
  anoFabricacao?: number
  anoModelo?: number
  cor?: string
  combustivel?: string
  tipo?: string
}

// corpos das requisições de login e cadastro
export type CorpoDoCadastro = {
  nomeCompleto: string
  email: string
  senha: string
  confirmarSenha?: string
}

export type CorpoDoLogin = {
  email: string
  senha: string
}

export type CorpoDoPerfil = {
  nome: string
  sobrenome?: string
  email: string
}

export type CorpoDaSenha = {
  senhaAtual: string
  novaSenha: string
  confirmarNovaSenha?: string
}
