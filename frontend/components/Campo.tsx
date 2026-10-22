type Props = {
  label: string
  valor: string
  aoMudar: (novoValor: string) => void
  tipo?: string
  placeholder?: string
  desabilitado?: boolean
}

export default function Campo({ label, valor, aoMudar, tipo, placeholder, desabilitado }: Props) {
  return (
    <div className="w-full">
      <label className="mb-1.5 block text-[12px] text-cinza">{label}</label>
      <input
        type={tipo || 'text'}
        value={valor}
        placeholder={placeholder}
        disabled={desabilitado}
        onChange={(e) => aoMudar(e.target.value)}
        className="w-full rounded-lg bg-campo px-3.5 py-2.5 text-[14px] text-white outline-none placeholder:text-cinza focus:ring-2 focus:ring-azul disabled:opacity-50"
      />
    </div>
  )
}
