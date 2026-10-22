import { describe, it, expect } from 'vitest'
import {
  emailEhValido,
  senhaEhValida,
  limparPlaca,
  placaEhValida,
  validarVeiculo
} from '../src/validacoes'

describe('emailEhValido', () => {
  it('aceita um email normal', () => {
    expect(emailEhValido('mariana.costa@email.com')).toBe(true)
  })

  it('recusa email sem arroba', () => {
    expect(emailEhValido('mariana.costa.email.com')).toBe(false)
  })

  it('recusa email sem ponto', () => {
    expect(emailEhValido('mariana@email')).toBe(false)
  })

  it('recusa vazio', () => {
    expect(emailEhValido('')).toBe(false)
  })
})

describe('senhaEhValida', () => {
  it('aceita senha com letra e número e 8 caracteres', () => {
    expect(senhaEhValida('drivo1234')).toBe(true)
  })

  it('recusa senha curta', () => {
    expect(senhaEhValida('abc123')).toBe(false)
  })

  it('recusa senha só com letras', () => {
    expect(senhaEhValida('abcdefghij')).toBe(false)
  })

  it('recusa senha só com números', () => {
    expect(senhaEhValida('12345678')).toBe(false)
  })
})

describe('limparPlaca', () => {
  it('tira o traço e deixa maiúsculo', () => {
    expect(limparPlaca('rtx-4b21')).toBe('RTX4B21')
  })

  it('tira espaço', () => {
    expect(limparPlaca(' abc 1234 ')).toBe('ABC1234')
  })
})

describe('placaEhValida', () => {
  it('aceita placa mercosul', () => {
    expect(placaEhValida('RTX4B21')).toBe(true)
  })

  it('aceita placa antiga', () => {
    expect(placaEhValida('ABC1234')).toBe(true)
  })

  it('aceita placa digitada com traço', () => {
    expect(placaEhValida('ABC-1234')).toBe(true)
  })

  it('recusa placa com tamanho errado', () => {
    expect(placaEhValida('ABC123')).toBe(false)
  })

  it('recusa placa com letra no lugar errado', () => {
    expect(placaEhValida('ABCD123')).toBe(false)
  })
})

describe('validarVeiculo', () => {
  function veiculoCerto() {
    return {
      placa: 'RTX4B21',
      renavam: '01234567890',
      chassi: '9BRBC3E31P1234821',
      marca: 'Toyota',
      modelo: 'Corolla Altis Hybrid',
      anoFabricacao: 2022,
      anoModelo: 2023,
      cor: 'Prata',
      combustivel: 'Híbrido',
      tipo: 'Automóvel'
    }
  }

  it('não devolve erro quando está tudo preenchido', () => {
    const erros = validarVeiculo(veiculoCerto())
    expect(erros.length).toBe(0)
  })

  it('reclama quando falta a placa', () => {
    const dados = veiculoCerto()
    dados.placa = ''
    const erros = validarVeiculo(dados)
    expect(erros).toContain('Placa é obrigatória')
  })

  it('reclama quando o chassi não tem 17 caracteres', () => {
    const dados = veiculoCerto()
    dados.chassi = '9BRBC3E31P4821'
    const erros = validarVeiculo(dados)
    expect(erros).toContain('Chassi deve ter 17 caracteres')
  })

  it('reclama quando o renavam é curto demais', () => {
    const dados = veiculoCerto()
    dados.renavam = '123'
    const erros = validarVeiculo(dados)
    expect(erros).toContain('Renavam deve ter pelo menos 9 números')
  })

  it('reclama quando o ano está fora da faixa', () => {
    const dados = veiculoCerto()
    dados.anoFabricacao = 1700
    const erros = validarVeiculo(dados)
    expect(erros).toContain('Ano de fabricação inválido')
  })

  it('junta mais de um erro quando falta mais de um campo', () => {
    const dados = veiculoCerto()
    dados.marca = ''
    dados.modelo = ''
    const erros = validarVeiculo(dados)
    expect(erros.length).toBe(2)
  })
})
