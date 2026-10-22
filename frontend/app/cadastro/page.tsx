'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../components/Logo'
import Campo from '../../components/Campo'
import { chamarApi, salvarLogin, pegarToken } from '../../lib/api'

export default function TelaDeCadastro() {
  const router = useRouter()

  const [nomeCompleto, setNomeCompleto] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    const token = pegarToken()
    if (token) {
      router.push('/veiculos')
    }
  }, [router])

  async function criarConta(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    // validações da tela
    if (nomeCompleto.trim().length < 3) {
      setErro('Digite seu nome completo')
      return
    }

    if (email.indexOf('@') === -1) {
      setErro('Digite um e-mail válido')
      return
    }

    if (senha.length < 8) {
      setErro('A senha precisa ter no mínimo 8 caracteres')
      return
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não são iguais')
      return
    }

    setCarregando(true)

    const resposta = await chamarApi('/auth/cadastro', 'POST', {
      nomeCompleto: nomeCompleto,
      email: email,
      senha: senha,
      confirmarSenha: confirmarSenha
    })

    setCarregando(false)

    if (resposta.ok) {
      // deixa a pessoa logada depois de criar a conta
      salvarLogin(resposta.dados.token, resposta.dados.usuario)
      router.push('/veiculos')
    } else {
      setErro(resposta.erro)
    }
  }

  return (
    <div className="min-h-screen p-3 sm:p-6">
      <div className="mx-auto grid max-w-[1180px] gap-6 lg:h-[calc(100vh-48px)] lg:grid-cols-2">
        <div className="relative hidden overflow-hidden rounded-3xl lg:block">
          <img
            src="/images/cadastro.jpg"
            alt="Sedan preto dentro de uma garagem de concreto"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
          <div className="absolute bottom-10 left-9 right-9">
            <h2 className="text-[34px] font-bold leading-tight">
              Cadastre uma vez.
              <br />O CRLV faz o resto.
            </h2>
            <p className="mt-3 max-w-[330px] text-[13px] text-cinza">
              Importe o documento e os dados do veículo são preenchidos automaticamente.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center overflow-y-auto py-10">
          <div className="w-full max-w-[340px]">
            <div className="mb-6 flex justify-center">
              <Logo largura={70} />
            </div>

            <h1 className="text-center text-[26px] font-bold">Criar sua conta</h1>
            <p className="mt-2 text-center text-[13px] text-cinza">
              Leva menos de um minuto. Depois é só adicionar seus veículos.
            </p>

            <form onSubmit={criarConta} className="mt-7 flex flex-col gap-4">
              <Campo
                label="Nome completo"
                valor={nomeCompleto}
                aoMudar={setNomeCompleto}
                placeholder="Seu nome e sobrenome"
              />

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
                placeholder="Mínimo de 8 caracteres"
              />

              <Campo
                label="Confirmar senha"
                tipo="password"
                valor={confirmarSenha}
                aoMudar={setConfirmarSenha}
                placeholder="Repita a senha"
              />

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
                {carregando ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>

            <p className="mt-12 text-center text-[13px] text-cinza">
              Já tem uma conta?{' '}
              <Link href="/login" className="font-medium text-azul">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
