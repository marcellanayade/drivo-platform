'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../../../components/Header'
import Campo from '../../../components/Campo'
import { chamarApi, enviarCrlv, pegarToken, pegarUsuario, Usuario } from '../../../lib/api'

export default function TelaDeNovoVeiculo() {
  const router = useRouter()
  const inputDoArquivo = useRef<HTMLInputElement>(null)

  const [usuario, setUsuario] = useState<Usuario | null>(null)

  // campos do form
  const [placa, setPlaca] = useState('')
  const [renavam, setRenavam] = useState('')
  const [chassi, setChassi] = useState('')
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [anoFabricacao, setAnoFabricacao] = useState('')
  const [anoModelo, setAnoModelo] = useState('')
  const [cor, setCor] = useState('')
  const [combustivel, setCombustivel] = useState('')
  const [tipo, setTipo] = useState('')
  const [apelido, setApelido] = useState('')

  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  // estados da parte do CRLV
  const [lendoCrlv, setLendoCrlv] = useState(false)
  // guarda nome e tamanho do arquivo pra mostrar na tela
  const [arquivoLido, setArquivoLido] = useState<{ nome: string; tamanho: string } | null>(null)
  const [erroDoCrlv, setErroDoCrlv] = useState('')

  useEffect(() => {
    const token = pegarToken()
    if (!token) {
      router.push('/login')
      return
    }
    setUsuario(pegarUsuario())
  }, [router])

  // pessoa escolhe o arquivo do CRLV, sistema manda pro back, que manda pro gemini e devolve os campos preenchidos
  async function aoEscolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    // o files pode vir null, por isso o "?" antes do [0]
    const arquivo = e.target.files?.[0]
    if (!arquivo) {
      return
    }

    setErroDoCrlv('')
    setArquivoLido(null)
    setLendoCrlv(true)

    const resposta = await enviarCrlv(arquivo)

    setLendoCrlv(false)

    if (resposta.ok) {
      const dados = resposta.dados.dados

      if (dados.placa) {
        setPlaca(dados.placa)
      }
      if (dados.renavam) {
        setRenavam(String(dados.renavam))
      }
      if (dados.chassi) {
        setChassi(dados.chassi)
      }
      if (dados.marca) {
        setMarca(dados.marca)
      }
      if (dados.modelo) {
        setModelo(dados.modelo)
      }
      if (dados.anoFabricacao) {
        setAnoFabricacao(String(dados.anoFabricacao))
      }
      if (dados.anoModelo) {
        setAnoModelo(String(dados.anoModelo))
      }
      if (dados.cor) {
        setCor(dados.cor)
      }
      if (dados.combustivel) {
        setCombustivel(dados.combustivel)
      }
      if (dados.tipo) {
        setTipo(dados.tipo)
      }

      // guardo o tamanho em KB 
      setArquivoLido({
        nome: arquivo.name,
        tamanho: Math.round(arquivo.size / 1024) + ' KB'
      })
    } else {
      setErroDoCrlv(resposta.erro)
    }

    // limpa input 
    e.target.value = ''
  }

  function abrirSeletorDeArquivo() {
    inputDoArquivo.current?.click()
  }

  async function salvarVeiculo(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setSalvando(true)

    const resposta = await chamarApi('/veiculos', 'POST', {
      placa: placa,
      renavam: renavam,
      chassi: chassi,
      marca: marca,
      modelo: modelo,
      anoFabricacao: Number(anoFabricacao),
      anoModelo: Number(anoModelo),
      cor: cor,
      combustivel: combustivel,
      tipo: tipo,
      apelido: apelido
    })

    setSalvando(false)

    if (resposta.ok) {
      router.push('/veiculos')
    } else {
      setErro(resposta.erro)
    }
  }

  // rodapé mostra nome do carro enquanto a pessoa digita
  let nomeDoRodape = 'Novo veículo'
  if (marca !== '' || modelo !== '') {
    nomeDoRodape = 'Novo veículo · ' + marca + ' ' + modelo
  }

  return (
    <div className="min-h-screen pb-24">
      <Header usuario={usuario} />

      <main className="mx-auto max-w-[1180px] px-5 py-7">
        <Link href="/veiculos" className="text-[13px] text-azul">
          Voltar
        </Link>
        <h1 className="mt-2 text-[32px] font-bold">Novo veículo</h1>

        <form onSubmit={salvarVeiculo} className="mt-6 grid gap-5 lg:grid-cols-[1fr_300px]">
          {/* coluna da esquerda */}
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-borda bg-painel p-6">
              <h2 className="text-[17px] font-semibold">Identificação</h2>
              <p className="mt-1 text-[12px] text-cinza">
                Dados oficiais do veículo, conforme o documento.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Campo label="Placa" valor={placa} aoMudar={setPlaca} placeholder="ABC1D23" />
                <Campo label="Renavam" valor={renavam} aoMudar={setRenavam} placeholder="00000000000" />
              </div>

              <div className="mt-4">
                <Campo label="Chassi" valor={chassi} aoMudar={setChassi} placeholder="17 caracteres" />
              </div>
            </div>

            <div className="rounded-2xl border border-borda bg-painel p-6">
              <h2 className="text-[17px] font-semibold">Características</h2>
              <p className="mt-1 text-[12px] text-cinza">
                Como o veículo aparece na sua garagem.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Campo label="Marca" valor={marca} aoMudar={setMarca} placeholder="Ex.: Toyota" />
                <Campo label="Modelo" valor={modelo} aoMudar={setModelo} placeholder="Ex.: Corolla" />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Campo
                  label="Ano de fabricação"
                  tipo="number"
                  valor={anoFabricacao}
                  aoMudar={setAnoFabricacao}
                  placeholder="2022"
                />
                <Campo
                  label="Ano do modelo"
                  tipo="number"
                  valor={anoModelo}
                  aoMudar={setAnoModelo}
                  placeholder="2023"
                />
                <Campo label="Cor" valor={cor} aoMudar={setCor} placeholder="Ex.: Prata" />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Campo
                  label="Combustível"
                  valor={combustivel}
                  aoMudar={setCombustivel}
                  placeholder="Ex.: Flex"
                />
                <Campo label="Tipo" valor={tipo} aoMudar={setTipo} placeholder="Ex.: Automóvel" />
                <Campo
                  label="Apelido (opcional)"
                  valor={apelido}
                  aoMudar={setApelido}
                  placeholder="Ex.: Carro da família"
                />
              </div>
            </div>

            {erro !== '' ? (
              <div className="rounded-lg border border-vermelho/40 bg-vermelho/10 px-4 py-3 text-[13px] text-vermelho">
                {erro}
              </div>
            ) : null}
          </div>

          {/* coluna da direita */}
          <div className="rounded-2xl border border-borda bg-painel p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-azul/20 text-azul">
                ⤓
              </span>
              <div>
                <h2 className="text-[15px] font-semibold">Importar CRLV</h2>
                <p className="mt-0.5 text-[12px] text-cinza">
                  Preenchemos o formulário para você
                </p>
              </div>
            </div>

            {/* input escondido */}
            <input
              ref={inputDoArquivo}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={aoEscolherArquivo}
              className="hidden"
            />

            {lendoCrlv ? (
              <div className="mt-4 rounded-xl bg-campo/60 px-3 py-3 text-[12px] text-cinza">
                Lendo o documento com a IA...
              </div>
            ) : null}

            {arquivoLido && lendoCrlv === false ? (
              <div className="mt-4 flex items-center justify-between rounded-xl bg-campo/60 px-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px]">{arquivoLido.nome}</p>
                  <p className="text-[11px] text-cinza">{arquivoLido.tamanho} · lido agora</p>
                </div>
                <span className="ml-2 text-[16px] text-[#32D74B]">✓</span>
              </div>
            ) : null}

            {erroDoCrlv !== '' ? (
              <div className="mt-4 rounded-xl border border-vermelho/40 bg-vermelho/10 px-3 py-3 text-[12px] text-vermelho">
                {erroDoCrlv}
              </div>
            ) : null}

            <button
              type="button"
              onClick={abrirSeletorDeArquivo}
              disabled={lendoCrlv}
              className="mt-4 w-full rounded-lg bg-campo py-2.5 text-[13px] font-semibold transition hover:bg-campo/70 disabled:opacity-60"
            >
              {arquivoLido ? 'Importar outro CRLV' : 'Selecionar arquivo'}
            </button>

            <p className="mt-3 text-[11px] text-cinza">
              Aceita PDF, JPG, PNG e WEBP de até 10 MB. Confira os dados depois que a IA
              preencher.
            </p>
          </div>

          {/* barra de baixo que fica fixa na tela */}
          <div className="fixed bottom-0 left-0 right-0 border-t border-borda bg-fundo/95 backdrop-blur">
            <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-3">
              <p className="hidden truncate text-[12px] text-cinza sm:block">{nomeDoRodape}</p>
              <div className="flex w-full gap-3 sm:w-auto">
                <Link
                  href="/veiculos"
                  className="flex-1 rounded-lg bg-campo px-6 py-2.5 text-center text-[13px] font-semibold sm:flex-none"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 rounded-lg bg-azul px-6 py-2.5 text-[13px] font-semibold disabled:opacity-60 sm:flex-none"
                >
                  {salvando ? 'Salvando...' : 'Salvar veículo'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
