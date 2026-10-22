import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      // Peguei essas cores do Figma pra nao ficar chutando hexadecimal
      // no meio do codigo toda hora.
      colors: {
        fundo: '#0A0A0B',
        painel: '#161618',
        campo: '#2C2C2E',
        borda: '#232326',
        azul: '#0A84FF',
        cinza: '#8E8E93',
        vermelho: '#FF453A'
      }
    }
  },
  plugins: []
}

export default config
