import { DadosDoVeiculo } from './tipos'

export function emailEhValido(email: any): boolean {
  if (!email) {
    return false
  }
  if (typeof email !== 'string') {
    return false
  }
  if (email.indexOf('@') === -1) {
    return false
  }
  if (email.indexOf('.') === -1) {
    return false
  }
  // @ não pode ser o primeiro nem o ultimo caractere
  if (email.startsWith('@') || email.endsWith('@')) {
    return false
  }
  if (email.indexOf(' ') !== -1) {
    return false
  }
  return true
}

// minimo 8 caracteres com letra e número
export function senhaEhValida(senha: any): boolean {
  if (!senha) {
    return false
  }
  if (typeof senha !== 'string') {
    return false
  }
  if (senha.length < 8) {
    return false
  }

  let temLetra = false
  let temNumero = false

  for (let i = 0; i < senha.length; i++) {
    const caractere = senha[i]
    if (caractere >= '0' && caractere <= '9') {
      temNumero = true
    } else if (caractere.toLowerCase() !== caractere.toUpperCase()) {
      temLetra = true
    }
  }

  if (temLetra === true && temNumero === true) {
    return true
  } else {
    return false
  }
}

// tira espaço e traço e deixa maiusc
// e eu quero salvar sempre como "RTX4B21".
export function limparPlaca(placa: any): string {
  if (!placa) {
    return ''
  }
  let limpa = String(placa).toUpperCase()
  limpa = limpa.replace(/[^A-Z0-9]/g, '')
  return limpa
}

// placa antiga = 3 letras + 4 numeros 
// placa mercosul = 3 letras + numero + letra + 2 numeros 
export function placaEhValida(placa: any): boolean {
  const limpa = limparPlaca(placa)

  if (limpa.length !== 7) {
    return false
  }

  const formatoAntigo = /^[A-Z]{3}[0-9]{4}$/
  const formatoMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/

  if (formatoAntigo.test(limpa)) {
    return true
  }
  if (formatoMercosul.test(limpa)) {
    return true
  }
  return false
}

// se a lista volta vazia tudo certo
export function validarVeiculo(dados: DadosDoVeiculo): string[] {
  const erros: string[] = []

  if (!dados.placa) {
    erros.push('Placa é obrigatória')
  } else if (!placaEhValida(dados.placa)) {
    erros.push('Placa inválida')
  }

  if (!dados.renavam) {
    erros.push('Renavam é obrigatório')
  } else if (String(dados.renavam).replace(/\D/g, '').length < 9) {
    erros.push('Renavam deve ter pelo menos 9 números')
  }

  if (!dados.chassi) {
    erros.push('Chassi é obrigatório')
  } else if (String(dados.chassi).trim().length !== 17) {
    erros.push('Chassi deve ter 17 caracteres')
  }

  if (!dados.marca) {
    erros.push('Marca é obrigatória')
  }

  if (!dados.modelo) {
    erros.push('Modelo é obrigatório')
  }

  const anoFabricacao = Number(dados.anoFabricacao)
  if (!anoFabricacao) {
    erros.push('Ano de fabricação é obrigatório')
  } else if (anoFabricacao < 1900 || anoFabricacao > 2100) {
    erros.push('Ano de fabricação inválido')
  }

  const anoModelo = Number(dados.anoModelo)
  if (!anoModelo) {
    erros.push('Ano do modelo é obrigatório')
  } else if (anoModelo < 1900 || anoModelo > 2100) {
    erros.push('Ano do modelo inválido')
  }

  if (!dados.cor) {
    erros.push('Cor é obrigatória')
  }

  if (!dados.combustivel) {
    erros.push('Combustível é obrigatório')
  }

  if (!dados.tipo) {
    erros.push('Tipo é obrigatório')
  }

  return erros
}
