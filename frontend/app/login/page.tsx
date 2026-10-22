'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../components/Logo'
import Campo from '../../components/Campo'
import { chamarApi, salvarLogin, pegarToken } from '../../lib/api'

export default function TelaDeLogin() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  // se a pessoa já estiver logada não mostra login
  useEffect(() => {
    const token = pegarToken()
    if (token) {
      router.push('/veiculos')
    }
  }, [router])

  async function fazerLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    // confere campos 
    if (email === '' || senha === '') {
      setErro('Preencha o e-mail e a senha')
      return
    }

    setCarregando(true)

    const resposta = await chamarApi('/auth/login', 'POST', {
      email: email,
      senha: senha
    })

    setCarregando(false)

    if (resposta.ok) {
      salvarLogin(resposta.dados.token, resposta.dados.usuario)
      router.push('/veiculos')
    } else {
      setErro(resposta.erro)
    }
  }

  return (
    <div className="min-h-screen p-3 sm:p-6">
      <div className="mx-auto grid max-w-[1180px] gap-6 lg:h-[calc(100vh-48px)] lg:grid-cols-2">
        {/* lado esquerdo: só a foto com o texto em cima,
            no celular ele some */}
        <div className="relative hidden overflow-hidden rounded-3xl lg:block">
          <img
            src="/images/login.jpg"
            alt="Carro esportivo preto em um estudio"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
          <div className="absolute bottom-10 left-9 right-9">
            <h2 className="text-[34px] font-bold leading-tight">
              Sua garagem,
              <br />
              sempre à mão.
            </h2>
            <p className="mt-3 max-w-[330px] text-[13px] text-cinza">
              Placa, Renavam e licenciamento de todos os seus veículos em um só lugar.
            </p>
          </div>
        </div>

        {/* lado direito: o formulario */}
        <div className="flex items-center justify-center overflow-y-auto py-10">
          <div className="w-full max-w-[340px]">
            <div className="mb-6 flex justify-center">
              <Logo largura={70} />
            </div>

            <h1 className="text-center text-[26px] font-bold">Entrar no Drivo</h1>
            <p className="mt-2 text-center text-[13px] text-cinza">
              Seus veículos, documentos e dados em um só lugar.
            </p>

            <form onSubmit={fazerLogin} className="mt-7 flex flex-col gap-4">
              <Campo
                label="E-mail"
                tipo="email"
                valor={email}
                aoMudar={setEmail}
                placeholder="voce@email.com"
              />

              <Campo
                label="Senha"
                tipo="password"
                valor={senha}
                aoMudar={setSenha}
                placeholder="Sua senha"
              />

              {/* caixa de erro quando tem erro */}
              {erro !== '' ? (
                <div className="rounded-lg border border-vermelho/40 bg-vermelho/10 px-3 py-2 text-[13px] text-vermelho">
                  {erro}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={carregando}
                className="mt-1 w-full rounded-lg bg-azul py-2.5 text-[14px] font-semibold text-white transition hover:bg-azul/90 disabled:opacity-60"
              >
                {carregando ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <p className="mt-12 text-center text-[13px] text-cinza">
              Ainda não tem conta?{' '}
              <Link href="/cadastro" className="font-medium text-azul">
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
