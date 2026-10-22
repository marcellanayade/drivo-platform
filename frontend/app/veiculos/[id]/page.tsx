'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '../../../components/Header'
import Campo from '../../../components/Campo'
import { chamarApi, enviarCrlv, pegarToken, pegarUsuario, Usuario, Veiculo } from '../../../lib/api'

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

// data igual no figma"14 mar 2026".
function formatarData(textoDaData: string): string {
  if (!textoDaData) {
    return '-'
  }

  const data = new Date(textoDaData)
  const hoje = new Date()

  const dia = data.getDate()
  const mes = MESES[data.getMonth()]
  const ano = data.getFullYear()

  const mesmoDia = data.getDate() === hoje.getDate()
  const mesmoMes = data.getMonth() === hoje.getMonth()
  const mesmoAno = data.getFullYear() === hoje.getFullYear()

  if (mesmoDia && mesmoMes && mesmoAno) {
    let hora = String(data.getHours())
    let minuto = String(data.getMinutes())
    if (hora.length === 1) {
      hora = '0' + hora
    }
    if (minuto.length === 1) {
      minuto = '0' + minuto
    }
    return 'Hoje, ' + hora + ':' + minuto
  }

  return dia + ' ' + mes + ' ' + ano
}

export default function TelaDeEditarVeiculo() {
  const router = useRouter()
  const parametros = useParams<{ id: string }>()
  const inputDoArquivo = useRef<HTMLInputElement>(null)

  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null)

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

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [mensagemOk, setMensagemOk] = useState('')

  const [lendoCrlv, setLendoCrlv] = useState(false)
  const [erroDoCrlv, setErroDoCrlv] = useState('')

  // pop up de confirmação antes de excluir
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  useEffect(() => {
    const token = pegarToken()
    if (!token) {
      router.push('/login')
      return
    }
    setUsuario(pegarUsuario())
    buscarVeiculo()
  }, [])

  async function buscarVeiculo() {
    setCarregando(true)

    const resposta = await chamarApi('/veiculos/' + parametros.id, 'GET')

    setCarregando(false)

    if (resposta.ok) {
      const dados = resposta.dados
      setVeiculo(dados)

      // manda dados do db pra dentro dos campos do form
      setPlaca(dados.placa)
      setRenavam(dados.renavam)
      setChassi(dados.chassi)
      setMarca(dados.marca)
      setModelo(dados.modelo)
      setAnoFabricacao(String(dados.anoFabricacao))
      setAnoModelo(String(dados.anoModelo))
      setCor(dados.cor)
      setCombustivel(dados.combustivel)
      setTipo(dados.tipo)
      setApelido(dados.apelido || '')
    } else {
      setErro(resposta.erro)
    }
  }

  // manda CRLV e preenche os campos
  async function aoEscolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    // o files pode vir null, por isso o "?" antes do [0]
    const arquivo = e.target.files?.[0]
    if (!arquivo) {
      return
    }

    setErroDoCrlv('')
    setMensagemOk('')
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

      setMensagemOk('CRLV lido. Confira os campos e salve as alterações.')
    } else {
      setErroDoCrlv(resposta.erro)
    }

    e.target.value = ''
  }

  async function salvarAlteracoes(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setMensagemOk('')
    setSalvando(true)

    const resposta = await chamarApi('/veiculos/' + parametros.id, 'PUT', {
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

  async function excluirVeiculo() {
    setExcluindo(true)

    const resposta = await chamarApi('/veiculos/' + parametros.id, 'DELETE')

    setExcluindo(false)

    if (resposta.ok) {
      router.push('/veiculos')
    } else {
      setMostrarConfirmacao(false)
      setErro(resposta.erro)
    }
  }

  // tela de carregando antes dos dados chegarem
  if (carregando) {
    return (
      <div className="min-h-screen">
        <Header usuario={usuario} />
        <main className="mx-auto max-w-[1180px] px-5 py-8">
          <div className="h-8 w-56 animate-pulse rounded bg-painel"></div>
          <div className="mt-6 h-64 animate-pulse rounded-2xl bg-painel"></div>
        </main>
      </div>
    )
  }

  // se veículo não existe ou não é do usuário
  if (!veiculo) {
    return (
      <div className="min-h-screen">
        <Header usuario={usuario} />
        <main className="mx-auto max-w-[1180px] px-5 py-20 text-center">
          <p className="text-[15px]">{erro || 'Veículo não encontrado'}</p>
          <Link href="/veiculos" className="mt-4 inline-block text-[13px] text-azul">
            Voltar para a garagem
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <Header usuario={usuario} />

      <main className="mx-auto max-w-[1180px] px-5 py-7">
        <Link href="/veiculos" className="text-[13px] text-azul">
          Voltar
        </Link>
        <h1 className="mt-2 text-[32px] font-bold">{veiculo.modelo}</h1>

        <form onSubmit={salvarAlteracoes} className="mt-6 grid gap-5 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-borda bg-painel p-6">
              <h2 className="text-[17px] font-semibold">Identificação</h2>
              <p className="mt-1 text-[12px] text-cinza">
                Dados oficiais do veículo, conforme o documento.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Campo label="Placa" valor={placa} aoMudar={setPlaca} />
                <Campo label="Renavam" valor={renavam} aoMudar={setRenavam} />
              </div>

              <div className="mt-4">
                <Campo label="Chassi" valor={chassi} aoMudar={setChassi} />
              </div>
            </div>

            <div className="rounded-2xl border border-borda bg-painel p-6">
              <h2 className="text-[17px] font-semibold">Características</h2>
              <p className="mt-1 text-[12px] text-cinza">
                Como o veículo aparece na sua garagem.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Campo label="Marca" valor={marca} aoMudar={setMarca} />
                <Campo label="Modelo" valor={modelo} aoMudar={setModelo} />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Campo
                  label="Ano de fabricação"
                  tipo="number"
                  valor={anoFabricacao}
                  aoMudar={setAnoFabricacao}
                />
                <Campo
                  label="Ano do modelo"
                  tipo="number"
                  valor={anoModelo}
                  aoMudar={setAnoModelo}
                />
                <Campo label="Cor" valor={cor} aoMudar={setCor} />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Campo label="Combustível" valor={combustivel} aoMudar={setCombustivel} />
                <Campo label="Tipo" valor={tipo} aoMudar={setTipo} />
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

            {mensagemOk !== '' ? (
              <div className="rounded-lg border border-[#32D74B]/40 bg-[#32D74B]/10 px-4 py-3 text-[13px] text-[#32D74B]">
                {mensagemOk}
              </div>
            ) : null}
          </div>

          {/* coluna da direita */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-borda bg-painel p-5 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-cinza">Cadastrado em</span>
                <span>{formatarData(veiculo.criadoEm)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-cinza">Última alteração</span>
                <span>{formatarData(veiculo.atualizadoEm)}</span>
              </div>
            </div>

            <input
              ref={inputDoArquivo}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={aoEscolherArquivo}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => inputDoArquivo.current?.click()}
              disabled={lendoCrlv}
              className="w-full rounded-lg bg-campo py-2.5 text-[13px] font-semibold transition hover:bg-campo/70 disabled:opacity-60"
            >
              {lendoCrlv ? 'Lendo o documento...' : 'Atualizar com novo CRLV'}
            </button>

            {erroDoCrlv !== '' ? (
              <div className="rounded-lg border border-vermelho/40 bg-vermelho/10 px-3 py-2 text-[12px] text-vermelho">
                {erroDoCrlv}
              </div>
            ) : null}

            <div className="rounded-2xl border border-borda bg-painel p-5">
              <h3 className="text-[15px] font-semibold">Excluir veículo</h3>
              <p className="mt-1 text-[12px] leading-relaxed text-cinza">
                Remove o veículo e todos os seus dados da sua garagem. Não é possível desfazer.
              </p>
              <button
                type="button"
                onClick={() => setMostrarConfirmacao(true)}
                className="mt-4 w-full rounded-lg bg-[#3A1416] py-2.5 text-[13px] font-semibold text-vermelho transition hover:bg-[#4A1A1D]"
              >
                Excluir veículo
              </button>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 border-t border-borda bg-fundo/95 backdrop-blur">
            <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-3">
              <p className="hidden truncate text-[12px] text-cinza sm:block">
                Editando · {veiculo.modelo} · {veiculo.placa}
              </p>
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
                  {salvando ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* pop up de confirmar exclusão */}
      {mostrarConfirmacao ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5">
          <div className="w-full max-w-[300px] rounded-2xl border border-borda bg-painel p-6 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-vermelho/15 text-[18px] text-vermelho">
              ⚠
            </div>
            <h3 className="mt-4 text-[16px] font-semibold">Excluir {veiculo.modelo}?</h3>
            <p className="mt-2 text-[12px] leading-relaxed text-cinza">
              O veículo de placa {veiculo.placa} e todos os seus dados serão removidos
              permanentemente.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setMostrarConfirmacao(false)}
                className="flex-1 rounded-lg bg-campo py-2.5 text-[13px] font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={excluirVeiculo}
                disabled={excluindo}
                className="flex-1 rounded-lg bg-[#FF453A] py-2.5 text-[13px] font-semibold disabled:opacity-60"
              >
                {excluindo ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
