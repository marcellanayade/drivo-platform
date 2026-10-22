'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import Campo from '../../components/Campo'
import { chamarApi, pegarToken, pegarUsuario, salvarLogin, sair, Usuario } from '../../lib/api'

const MESES_INTEIROS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
]

export default function TelaDePerfil() {
  const router = useRouter()

  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)

  // campos dos dados pessoais
  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [email, setEmail] = useState('')
  const [salvandoDados, setSalvandoDados] = useState(false)
  const [erroDosDados, setErroDosDados] = useState('')
  const [okDosDados, setOkDosDados] = useState('')

  // campos da senha
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [erroDaSenha, setErroDaSenha] = useState('')
  const [okDaSenha, setOkDaSenha] = useState('')

  useEffect(() => {
    const token = pegarToken()
    if (!token) {
      router.push('/login')
      return
    }
    buscarPerfil()
  }, [])

  async function buscarPerfil() {
    setCarregando(true)

    const resposta = await chamarApi('/perfil', 'GET')

    setCarregando(false)

    if (resposta.ok) {
      setUsuario(resposta.dados)
      setNome(resposta.dados.nome)
      setSobrenome(resposta.dados.sobrenome || '')
      setEmail(resposta.dados.email)
    } else {
      // se o token venceu login de novo
      setErroDosDados(resposta.erro)
    }
  }

  async function salvarDados(e: React.FormEvent) {
    e.preventDefault()
    setErroDosDados('')
    setOkDosDados('')

    if (nome.trim() === '') {
      setErroDosDados('O nome é obrigatório')
      return
    }

    setSalvandoDados(true)

    const resposta = await chamarApi('/perfil', 'PUT', {
      nome: nome,
      sobrenome: sobrenome,
      email: email
    })

    setSalvandoDados(false)

    if (resposta.ok) {
      setOkDosDados('Dados salvos!')

      // atualiza o que está guardado no navegador ("if" pq pegarToken pode devolver null)
      const token = pegarToken()
      if (token) {
        salvarLogin(token, resposta.dados)
      }
      setUsuario(resposta.dados)
    } else {
      setErroDosDados(resposta.erro)
    }
  }

  async function alterarSenha(e: React.FormEvent) {
    e.preventDefault()
    setErroDaSenha('')
    setOkDaSenha('')

    if (senhaAtual === '' || novaSenha === '') {
      setErroDaSenha('Preencha a senha atual e a nova senha')
      return
    }

    if (novaSenha !== confirmarNovaSenha) {
      setErroDaSenha('As senhas não são iguais')
      return
    }

    setSalvandoSenha(true)

    const resposta = await chamarApi('/perfil/senha', 'PUT', {
      senhaAtual: senhaAtual,
      novaSenha: novaSenha,
      confirmarNovaSenha: confirmarNovaSenha
    })

    setSalvandoSenha(false)

    if (resposta.ok) {
      setOkDaSenha('Senha alterada!')
      // limpa os campos 
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarNovaSenha('')
    } else {
      setErroDaSenha(resposta.erro)
    }
  }

  // logout
  function fazerLogout() {
    sair()
    router.push('/login')
  }

  // "Membro desde março de 2026"
  let membroDesde = ''
  if (usuario && usuario.criadoEm) {
    const data = new Date(usuario.criadoEm)
    membroDesde = 'Membro desde ' + MESES_INTEIROS[data.getMonth()] + ' de ' + data.getFullYear()
  }

  let iniciais = ''
  if (usuario) {
    iniciais = (usuario.nome[0] || '') + (usuario.sobrenome ? usuario.sobrenome[0] : '')
    iniciais = iniciais.toUpperCase()
  }

  if (carregando) {
    return (
      <div className="min-h-screen">
        <Header usuario={null} />
        <main className="mx-auto max-w-[920px] px-5 py-10">
          <div className="h-20 w-full animate-pulse rounded-2xl bg-painel"></div>
          <div className="mt-6 h-48 w-full animate-pulse rounded-2xl bg-painel"></div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header usuario={usuario} />

      <main className="mx-auto max-w-[920px] px-5 py-10">
        {/* cabeçalho com nome */}
        <div className="flex items-center gap-5">
          <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[#6C5CE7] text-[22px] font-semibold">
            {iniciais}
          </div>
          <div>
            <h1 className="text-[28px] font-bold">
              {usuario ? usuario.nome + ' ' + (usuario.sobrenome || '') : ''}
            </h1>
            <p className="mt-1 text-[13px] text-cinza">
              {usuario ? usuario.email : ''} · {membroDesde}
            </p>
          </div>
        </div>

        {/* informações pessoais */}
        <section className="mt-10 grid gap-5 md:grid-cols-[230px_1fr]">
          <div>
            <h2 className="text-[15px] font-semibold">Informações pessoais</h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-cinza">
              Seu nome aparece no app. O e-mail é usado para entrar e receber avisos.
            </p>
          </div>

          <form onSubmit={salvarDados} className="rounded-2xl border border-borda bg-painel">
            <div className="p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="Nome" valor={nome} aoMudar={setNome} />
                <Campo label="Sobrenome" valor={sobrenome} aoMudar={setSobrenome} />
              </div>
              <div className="mt-4">
                <Campo label="E-mail" tipo="email" valor={email} aoMudar={setEmail} />
              </div>

              {erroDosDados !== '' ? (
                <p className="mt-3 text-[12px] text-vermelho">{erroDosDados}</p>
              ) : null}
              {okDosDados !== '' ? (
                <p className="mt-3 text-[12px] text-[#32D74B]">{okDosDados}</p>
              ) : null}
            </div>

            <div className="flex items-center justify-between border-t border-borda px-5 py-3">
              <p className="hidden text-[12px] text-cinza sm:block">
                Alterações salvas ficam visíveis na hora.
              </p>
              <button
                type="submit"
                disabled={salvandoDados}
                className="rounded-lg bg-azul px-5 py-2 text-[13px] font-semibold disabled:opacity-60"
              >
                {salvandoDados ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </section>

        {/* senha */}
        <section className="mt-8 grid gap-5 md:grid-cols-[230px_1fr]">
          <div>
            <h2 className="text-[15px] font-semibold">Senha</h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-cinza">
              Use ao menos 8 caracteres, combinando letras e números. Você continuará conectado
              neste dispositivo.
            </p>
          </div>

          <form onSubmit={alterarSenha} className="rounded-2xl border border-borda bg-painel">
            <div className="p-5">
              <Campo
                label="Senha atual"
                tipo="password"
                valor={senhaAtual}
                aoMudar={setSenhaAtual}
                placeholder="Sua senha de hoje"
              />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Campo
                  label="Nova senha"
                  tipo="password"
                  valor={novaSenha}
                  aoMudar={setNovaSenha}
                  placeholder="Mínimo de 8 caracteres"
                />
                <Campo
                  label="Confirmar nova senha"
                  tipo="password"
                  valor={confirmarNovaSenha}
                  aoMudar={setConfirmarNovaSenha}
                  placeholder="Repita a nova senha"
                />
              </div>

              {erroDaSenha !== '' ? (
                <p className="mt-3 text-[12px] text-vermelho">{erroDaSenha}</p>
              ) : null}
              {okDaSenha !== '' ? (
                <p className="mt-3 text-[12px] text-[#32D74B]">{okDaSenha}</p>
              ) : null}
            </div>

            <div className="flex items-center justify-between border-t border-borda px-5 py-3">
              <p className="hidden text-[12px] text-cinza sm:block">
                Altere sua senha com segurança
              </p>
              <button
                type="submit"
                disabled={salvandoSenha}
                className="rounded-lg bg-campo px-5 py-2 text-[13px] font-semibold disabled:opacity-60"
              >
                {salvandoSenha ? 'Alterando...' : 'Alterar senha'}
              </button>
            </div>
          </form>
        </section>

        {/* sair */}
        <section className="mt-8 grid gap-5 pb-16 md:grid-cols-[230px_1fr]">
          <div>
            <h2 className="text-[15px] font-semibold">Conta</h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-cinza">
              Encerre a sessão neste dispositivo.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-borda bg-painel p-5">
            <div>
              <p className="text-[14px] font-semibold">Sair da conta</p>
              <p className="mt-0.5 text-[12px] text-cinza">Encerra a sessão neste dispositivo</p>
            </div>
            <button
              type="button"
              onClick={fazerLogout}
              className="text-[13px] font-medium text-azul"
            >
              Sair
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
