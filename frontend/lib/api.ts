
const URL_DA_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

// datas chegam do back como string
export type Usuario = {
  id: string
  nome: string
  sobrenome: string
  email: string
  criadoEm: string
  totalDeVeiculos?: number
}

export type Veiculo = {
  id: string
  placa: string
  renavam: string
  chassi: string
  marca: string
  modelo: string
  anoFabricacao: number
  anoModelo: number
  cor: string
  combustivel: string
  tipo: string
  apelido: string | null
  fotoUrl: string | null
  criadoEm: string
  atualizadoEm: string
}

// o que o gemini devolve depois de ler o CRLV
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

// formato que toda chamada devolve
export type Resposta = {
  ok: boolean
  status: number
  dados: any
  erro: string
}

// guarda token e usuário no localStorage
export function salvarLogin(token: string, usuario: Usuario) {
  localStorage.setItem('drivo_token', token)
  localStorage.setItem('drivo_usuario', JSON.stringify(usuario))
}

export function pegarToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return localStorage.getItem('drivo_token')
}

export function pegarUsuario(): Usuario | null {
  if (typeof window === 'undefined') {
    return null
  }
  const texto = localStorage.getItem('drivo_usuario')
  if (!texto) {
    return null
  }
  try {
    return JSON.parse(texto) as Usuario
  } catch (error) {
    console.log(error)
    return null
  }
}

export function sair() {
  localStorage.removeItem('drivo_token')
  localStorage.removeItem('drivo_usuario')
}

// token dura 7 dias (depois redireciona pro login)
function tratarTokenVencido(caminho: string) {
  if (caminho.startsWith('/auth')) {
    return
  }
  if (typeof window === 'undefined') {
    return
  }
  sair()
  window.location.href = '/login'
}

// função que faz chamada devolve sempre { ok, dados } 
export async function chamarApi(
  caminho: string,
  metodo?: string,
  corpo?: any
): Promise<Resposta> {
  try {
    const cabecalhos: Record<string, string> = {}

    const token = pegarToken()
    if (token) {
      cabecalhos['Authorization'] = 'Bearer ' + token
    }

    const opcoes: RequestInit = {
      method: metodo || 'GET',
      headers: cabecalhos
    }

    if (corpo) {
      cabecalhos['Content-Type'] = 'application/json'
      opcoes.body = JSON.stringify(corpo)
    }

    const resposta = await fetch(URL_DA_API + caminho, opcoes)
    const dados = await resposta.json()

    if (resposta.ok) {
      return { ok: true, status: resposta.status, dados: dados, erro: '' }
    } else {
      if (resposta.status === 401) {
        tratarTokenVencido(caminho)
      }
      // back sempre devolve { erro: "..." } quando dá problema
      return {
        ok: false,
        status: resposta.status,
        dados: null,
        erro: dados.erro || 'Deu algum erro, tenta de novo'
      }
    }
  } catch (error) {
    console.log(error)
    // status 0 pq nem chegou a ter resposta do servidor
    return { ok: false, status: 0, dados: null, erro: 'Não consegui falar com o servidor' }
  }
}

//upload de arquivo não pode mandar Content-Type json
export async function enviarCrlv(arquivo: File): Promise<Resposta> {
  try {
    const formulario = new FormData()
    formulario.append('arquivo', arquivo)

    const cabecalhos: Record<string, string> = {}

    const token = pegarToken()
    if (token) {
      cabecalhos['Authorization'] = 'Bearer ' + token
    }

    const resposta = await fetch(URL_DA_API + '/veiculos/crlv', {
      method: 'POST',
      headers: cabecalhos,
      body: formulario
    })

    const dados = await resposta.json()

    if (resposta.ok) {
      return { ok: true, status: resposta.status, dados: dados, erro: '' }
    } else {
      if (resposta.status === 401) {
        tratarTokenVencido('/veiculos/crlv')
      }
      return {
        ok: false,
        status: resposta.status,
        dados: null,
        erro: dados.erro || 'Não consegui ler o CRLV'
      }
    }
  } catch (error) {
    console.log(error)
    return { ok: false, status: 0, dados: null, erro: 'Não consegui falar com o servidor' }
  }
}
