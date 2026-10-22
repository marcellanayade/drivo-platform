'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../../components/Header'
import CardVeiculo from '../../components/CardVeiculo'
import { chamarApi, pegarToken, pegarUsuario, Usuario, Veiculo } from '../../lib/api'

export default function TelaDaGaragem() {
  const router = useRouter()

  // avisa tipo aqui pq começa com null e com lista vazia
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  // sem token volta pro login
  useEffect(() => {
    const token = pegarToken()
    if (!token) {
      router.push('/login')
      return
    }
    setUsuario(pegarUsuario())
  }, [router])

  // chama api toda vez que a busca muda
  useEffect(() => {
    const token = pegarToken()
    if (!token) {
      return
    }

    const temporizador = setTimeout(() => {
      buscarVeiculos(busca)
    }, 400)

    return () => clearTimeout(temporizador)
  }, [busca])

  async function buscarVeiculos(termo: string) {
    setCarregando(true)
    setErro('')

    let caminho = '/veiculos'
    if (termo && termo.trim() !== '') {
      caminho = '/veiculos?busca=' + encodeURIComponent(termo.trim())
    }

    const resposta = await chamarApi(caminho, 'GET')

    setCarregando(false)

    if (resposta.ok) {
      setVeiculos(resposta.dados)
    } else {
      setErro(resposta.erro)
    }
  }

  // txt de "X veiculos cadastrados" 
  let textoDaContagem = ''
  if (veiculos.length === 1) {
    textoDaContagem = '1 veículo cadastrado'
  } else {
    textoDaContagem = veiculos.length + ' veículos cadastrados'
  }

  // tela vazia quando a pessoa não tem nenhum veiculo e se a chamada falhar 
  const garagemVazia = carregando === false && erro === '' && veiculos.length === 0 && busca === ''
  const buscaSemResultado = carregando === false && erro === '' && veiculos.length === 0 && busca !== ''

  return (
    <div className="min-h-screen">
      <Header usuario={usuario} />

      <main className="mx-auto max-w-[1180px] px-5 py-8">
        {garagemVazia ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <h2 className="text-[26px] font-bold">Sua garagem está vazia</h2>
            <p className="mt-2 max-w-[400px] text-[13px] text-cinza">
              Adicione seu primeiro veículo. Com o CRLV em mãos, a maior parte dos dados é
              preenchida automaticamente.
            </p>
            <Link
              href="/veiculos/novo"
              className="mt-6 rounded-lg bg-azul px-5 py-2.5 text-[14px] font-semibold"
            >
              Importar CRLV
            </Link>
          </div>
        ) : (
          <>
            {/* título + botão de adicionar + campo de busca */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-[32px] font-bold">Meus veículos</h1>
                  <Link
                    href="/veiculos/novo"
                    title="Adicionar veículo"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-azul text-xl leading-none"
                  >
                    +
                  </Link>
                </div>
                <p className="mt-1 text-[13px] text-cinza">
                  {carregando ? 'Carregando...' : textoDaContagem}
                </p>
              </div>

              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por placa ou modelo"
                className="w-full rounded-lg bg-painel px-4 py-2.5 text-[14px] outline-none placeholder:text-cinza focus:ring-2 focus:ring-azul sm:w-[260px]"
              />
            </div>

            {erro !== '' ? (
              <div className="mt-6 rounded-lg border border-vermelho/40 bg-vermelho/10 px-4 py-3 text-[13px] text-vermelho">
                {erro}
              </div>
            ) : null}

            {/* enquanto carrega mostra blocos cinzas no lugar dos cards */}
            {carregando ? (
              <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="h-[340px] animate-pulse rounded-2xl bg-painel"></div>
                <div className="h-[340px] animate-pulse rounded-2xl bg-painel"></div>
                <div className="h-[340px] animate-pulse rounded-2xl bg-painel"></div>
              </div>
            ) : null}

            {buscaSemResultado ? (
              <div className="mt-16 text-center">
                <p className="text-[15px]">Nenhum veículo encontrado para "{busca}"</p>
                <p className="mt-1 text-[13px] text-cinza">
                  Tente buscar pela placa, pela marca ou pelo modelo.
                </p>
              </div>
            ) : null}

            {carregando === false && veiculos.length > 0 ? (
              <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {veiculos.map((veiculo) => (
                  <CardVeiculo key={veiculo.id} veiculo={veiculo} />
                ))}

                {/* cartão tracejado de adicionar, quando não está filtrando */}
                {busca === '' ? (
                  <Link
                    href="/veiculos/novo"
                    className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#3A3A3C] text-center transition hover:border-azul"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3A3A3C] text-xl">
                      +
                    </span>
                    <p className="mt-3 text-[14px] font-semibold">Adicionar veículo</p>
                    <p className="mt-1 text-[12px] text-cinza">
                      Preencha manualmente ou importe o CRLV
                    </p>
                  </Link>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  )
}
