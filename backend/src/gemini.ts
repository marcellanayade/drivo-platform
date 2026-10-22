import { DadosDoCrlv } from './tipos'

const CHAVE = process.env.GEMINI_API_KEY
const MODELO = process.env.GEMINI_MODEL || 'gemini-3.5-flash'
const URL_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

// 3 tentativas caso dê gemini sobrecarregado 
const TENTATIVAS = 3
const ESPERA_ENTRE_TENTATIVAS = 2000

// pausa execução
function esperar(milissegundos: number) {
  return new Promise((resolve) => setTimeout(resolve, milissegundos))
}

const INSTRUCAO = `Você vai receber a imagem ou o PDF de um CRLV (Certificado de Registro e Licenciamento de Veículo) do Brasil.
Leia o documento e devolva SOMENTE um JSON, sem comentários e sem markdown, exatamente neste formato:

{
  "placa": "",
  "renavam": "",
  "chassi": "",
  "marca": "",
  "modelo": "",
  "anoFabricacao": 0,
  "anoModelo": 0,
  "cor": "",
  "combustivel": "",
  "tipo": ""
}

Regras:
- No CRLV a marca e o modelo vêm juntos no campo "MARCA / MODELO / VERSÃO" (exemplo: "TOYOTA/COROLLA ALTIS HYBRID"). Separe: antes da barra é a marca, depois da barra é o modelo.
- "placa" deve vir só com letras e números, sem traço.
- "renavam" e "chassi" só com os caracteres, sem espaço. O chassi sempre tem
17 caracteres, então confira a quantidade antes de responder.
- "anoFabricacao" e "anoModelo" devem ser números.
- "cor" é o campo COR PREDOMINANTE.
- "tipo" sai do campo ESPÉCIE/TIPO, que no documento traz as duas informações
separadas por barra (exemplo: "PASSAGEIRO/AUTOMOVEL"). Eu quero só o que vem DEPOIS
da barra, que é o tipo: "Automóvel". Se não tiver barra, use o valor inteiro.
- Escreva marca, modelo, cor, combustível e tipo com a primeira letra maiúscula e com os acentos do português (exemplo: "Prata", "Flex", "Automóvel", "Álcool/Gasolina").
- Se não conseguir achar algum campo, deixe o texto vazio ou o número 0.`

//limpa antes de dar JSON.parse
export function lerRespostaDoGemini(texto: string): DadosDoCrlv | null {
  if (!texto) {
    return null
  }

  let limpo = texto.trim()

  if (limpo.startsWith('```')) {
    // tira a primeira linha (```json) e o ``` do final
    limpo = limpo.replace(/^```[a-zA-Z]*\n?/, '')
    limpo = limpo.replace(/```$/, '')
    limpo = limpo.trim()
  }

  // se ainda assim vier texto pego do primeiro ate o ultim
  const inicio = limpo.indexOf('{')
  const fim = limpo.lastIndexOf('}')
  if (inicio === -1 || fim === -1) {
    return null
  }
  limpo = limpo.substring(inicio, fim + 1)

  try {
    const json = JSON.parse(limpo) as DadosDoCrlv
    return json
  } catch (error) {
    console.log(error)
    return null
  }
}

// manda arquivo pro gemini em base64 e devolve os dados do veículo
export async function lerCrlvComGemini(
  arquivoBase64: string,
  tipoDoArquivo: string
): Promise<DadosDoCrlv> {
  if (!CHAVE) {
    throw new Error('GEMINI_API_KEY não configurada no .env')
  }

  const corpo = {
    contents: [
      {
        parts: [
          { text: INSTRUCAO },
          {
            inline_data: {
              mime_type: tipoDoArquivo,
              data: arquivoBase64
            }
          }
        ]
      }
    ],
    generationConfig: {
      // temperatura baixa pra ela não inventar
      temperature: 0,
      responseMimeType: 'application/json'
    }
  }

  // caso precise repetir chamada 
  async function chamarOGemini() {
    return fetch(URL_BASE + '/' + MODELO + ':generateContent?key=' + CHAVE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo)
    })
  }

  let resposta = await chamarOGemini()
  let tentativa = 1

  // caso IA esteja sobrecarregada
  while (!resposta.ok && resposta.status === 503 && tentativa < TENTATIVAS) {
    console.log('Gemini devolveu ' + resposta.status + ', tentando de novo (' + tentativa + ' de ' + TENTATIVAS + ')')
    await esperar(ESPERA_ENTRE_TENTATIVAS)
    tentativa = tentativa + 1
    resposta = await chamarOGemini()
  }

  if (!resposta.ok) {
    const textoDoErro = await resposta.text()
    console.log('Erro do Gemini:', textoDoErro)

    if (resposta.status === 503 || resposta.status === 429) {
      throw new Error('GEMINI_OCUPADO')
    }

    throw new Error('Não consegui falar com a API do Gemini')
  }

  const json: any = await resposta.json()

  let textoDaResposta = ''
  if (json.candidates && json.candidates[0] && json.candidates[0].content) {
    const partes = json.candidates[0].content.parts
    if (partes && partes[0]) {
      textoDaResposta = partes[0].text
    }
  }

  const dados = lerRespostaDoGemini(textoDaResposta)

  if (!dados) {
    throw new Error('Não consegui entender a resposta do Gemini')
  }

  return dados
}
