'use client'

import Link from 'next/link'
import { Veiculo } from '../lib/api'

type Props = {
  veiculo: Veiculo
}

// cores da bola do lado do nome da cor, se vier uma cor que não está nessa lista usa cinza (Record<string, string> pq busca por texto).
const CORES: Record<string, string> = {
  branco: '#FFFFFF',
  prata: '#C7C7CC',
  cinza: '#8E8E93',
  preto: '#3A3A3C',
  azul: '#0A84FF',
  vermelho: '#FF453A',
  verde: '#32D74B',
  amarelo: '#FFD60A',
  marrom: '#8B5A2B',
  bege: '#D9C7A5',
  dourado: '#D4AF37',
  laranja: '#FF9F0A',
  rosa: '#FF6482',
  roxo: '#BF5AF2'
}

// chassi
function esconderChassi(chassi: string): string {
  if (!chassi) {
    return ''
  }
  if (chassi.length <= 7) {
    return chassi
  }
  const comeco = chassi.substring(0, 3)
  const fim = chassi.substring(chassi.length - 4)
  return comeco + '•••••' + fim
}

export default function CardVeiculo({ veiculo }: Props) {
  let corDaBolinha = CORES[veiculo.cor.toLowerCase()]
  if (!corDaBolinha) {
    corDaBolinha = '#8E8E93'
  }

  return (
    <Link
      href={'/veiculos/' + veiculo.id}
      className="group block overflow-hidden rounded-2xl border border-borda bg-painel transition hover:border-azul"
    >
      {/* foto do carro */}
      <div className="h-[160px] w-full bg-[#1C1C1E]">
        {veiculo.fotoUrl ? (
          <img
            src={veiculo.fotoUrl}
            alt={veiculo.marca + ' ' + veiculo.modelo}
            className="h-full w-full object-cover"
          />
        ) : (
          // quando o veículo não tem foto mostra o nome dele
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1C1C1E] to-[#0E0E10]">
            <span className="text-sm text-cinza">{veiculo.marca}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-[11px] uppercase tracking-wider text-cinza">{veiculo.marca}</p>

        <div className="mt-1 flex items-start justify-between gap-3">
          <h3 className="text-[17px] font-semibold leading-tight">{veiculo.modelo}</h3>

          <div className="shrink-0 overflow-hidden rounded-md border border-[#3A3A3C] bg-white">
            <div className="bg-[#0C4DA2] px-2 py-[1px] text-[6px] font-bold tracking-[0.2em] text-white">
              BRASIL
            </div>
            <div className="px-2 py-[2px] text-center font-mono text-[13px] font-bold text-black">
              {veiculo.placa}
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 text-[13px] text-cinza">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: corDaBolinha }}
          ></span>
          <span>
            {veiculo.cor} · {veiculo.anoFabricacao}/{veiculo.anoModelo} · {veiculo.combustivel}
          </span>
        </div>

        {veiculo.apelido ? (
          <p className="mt-1 text-[13px] text-azul">{veiculo.apelido}</p>
        ) : null}

        {/* rodapé do card com renavam, chassi e seta */}
        <div className="mt-4 flex items-end justify-between border-t border-borda pt-3">
          <div className="flex gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-cinza">Renavam</p>
              <p className="font-mono text-[12px]">{veiculo.renavam}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-cinza">Chassi</p>
              <p className="font-mono text-[12px]">{esconderChassi(veiculo.chassi)}</p>
            </div>
          </div>

          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-borda text-cinza transition group-hover:border-azul group-hover:text-azul">
            →
          </span>
        </div>
      </div>
    </Link>
  )
}
