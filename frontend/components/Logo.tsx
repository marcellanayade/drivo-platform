type Props = {
  largura?: number
}

const LARGURA_ORIGINAL = 88
const ALTURA_ORIGINAL = 28

export default function Logo({ largura }: Props) {
  const tamanho = largura || 44
  const altura = (tamanho * ALTURA_ORIGINAL) / LARGURA_ORIGINAL

  return (
    <img
      src="/images/logo.png"
      alt="Drivo"
      width={tamanho}
      height={altura}
      style={{ width: tamanho, height: altura }}
    />
  )
}
