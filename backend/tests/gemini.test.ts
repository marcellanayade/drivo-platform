import { describe, it, expect } from 'vitest'
import { lerRespostaDoGemini } from '../src/gemini'

// testa resposta do gemini sem chamar a api
describe('lerRespostaDoGemini', () => {
  it('lê um JSON normal', () => {
    const texto = '{"placa":"RTX4B21","marca":"Toyota"}'
    const dados = lerRespostaDoGemini(texto)
    expect(dados).not.toBeNull()
    expect(dados?.placa).toBe('RTX4B21')
    expect(dados?.marca).toBe('Toyota')
  })

  it('lê o JSON quando vem dentro de bloco de código markdown', () => {
    const texto = '```json\n{"placa":"QPL8C34","anoModelo":2024}\n```'
    const dados = lerRespostaDoGemini(texto)
    expect(dados).not.toBeNull()
    expect(dados?.placa).toBe('QPL8C34')
    expect(dados?.anoModelo).toBe(2024)
  })

  it('lê o JSON quando vem com texto antes e depois', () => {
    const texto = 'Claro! Segue os dados do documento: {"placa":"FHD2E09"} Espero ter ajudado.'
    const dados = lerRespostaDoGemini(texto)
    expect(dados).not.toBeNull()
    expect(dados?.placa).toBe('FHD2E09')
  })

  it('devolve null quando não tem JSON nenhum', () => {
    const dados = lerRespostaDoGemini('Não consegui ler esse documento.')
    expect(dados).toBe(null)
  })

  it('devolve null quando o JSON está quebrado', () => {
    const dados = lerRespostaDoGemini('{"placa": "RTX4B21",,}')
    expect(dados).toBe(null)
  })

  it('devolve null quando vem vazio', () => {
    expect(lerRespostaDoGemini('')).toBe(null)
  })
})
