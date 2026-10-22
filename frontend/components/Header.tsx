'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Logo from './Logo'
import { Usuario } from '../lib/api'

// usuário pode vir null enquanto a pág ainda está buscando os dados
type Props = {
  usuario: Usuario | null
}

// cabeçalho que aparece nas telas de dentro do app (garagem e perfil)
export default function Header({ usuario }: Props) {
  const router = useRouter()
  const caminhoAtual = usePathname()

  // pega as iniciais 
  let iniciais = '?'
  if (usuario) {
    let letras = ''
    if (usuario.nome) {
      letras = letras + usuario.nome[0]
    }
    if (usuario.sobrenome) {
      letras = letras + usuario.sobrenome[0]
    }
    if (letras !== '') {
      iniciais = letras.toUpperCase()
    }
  }

  let nomeCompleto = ''
  if (usuario) {
    nomeCompleto = usuario.nome + ' ' + (usuario.sobrenome || '')
  }

  // aba "Meus veiculos" fica acesa em qualquer tela de veículo
  const estaNaGaragem = caminhoAtual.startsWith('/veiculos')
  const estaNoPerfil = caminhoAtual.startsWith('/perfil')

  const abaAtiva = 'bg-campo text-white'
  const abaNormal = 'text-cinza hover:text-white'

  return (
    <header className="border-b border-borda">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4">
        {/* logo da esquerda */}
        <button
          onClick={() => router.push('/veiculos')}
          className="flex items-center gap-2"
        >
          <Logo largura={42} />
          <span className="text-[17px] font-semibold">Drivo</span>
        </button>

        {/* abas do meio */}
        <nav className="hidden rounded-full bg-painel p-1 sm:flex">
          <Link
            href="/veiculos"
            className={'rounded-full px-4 py-1.5 text-sm ' + (estaNaGaragem ? abaAtiva : abaNormal)}
          >
            Meus veículos
          </Link>
          <Link
            href="/perfil"
            className={'rounded-full px-4 py-1.5 text-sm ' + (estaNoPerfil ? abaAtiva : abaNormal)}
          >
            Perfil
          </Link>
        </nav>

        {/* nome e bola da direita */}
        <Link href="/perfil" className="flex items-center gap-3">
          <span className="hidden text-sm text-cinza sm:block">{nomeCompleto}</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6C5CE7] text-[11px] font-semibold">
            {iniciais}
          </span>
        </Link>
      </div>

      {/* no celular as abas vão pra baixo */}
      <nav className="flex gap-2 px-5 pb-3 sm:hidden">
        <Link
          href="/veiculos"
          className={'rounded-full px-4 py-1.5 text-sm ' + (estaNaGaragem ? abaAtiva : abaNormal)}
        >
          Meus veículos
        </Link>
        <Link
          href="/perfil"
          className={'rounded-full px-4 py-1.5 text-sm ' + (estaNoPerfil ? abaAtiva : abaNormal)}
        >
          Perfil
        </Link>
      </nav>
    </header>
  )
}
