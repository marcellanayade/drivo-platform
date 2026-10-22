import { FastifyInstance } from 'fastify'
import { Prisma } from '@prisma/client'
import prisma from '../db'
import { precisaEstarLogado } from '../auth'
import { validarVeiculo, limparPlaca } from '../validacoes'
import { lerCrlvComGemini } from '../gemini'
import { DadosDoVeiculo } from '../tipos'

// tipos de arquivo aceitos no upload do CRLV
const TIPOS_ACEITOS = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']

// rotas de veículo (pedem login)
export default async function rotasDeVeiculos(app: FastifyInstance) {
  // lista veículos do usuário
  app.get('/veiculos', {
    preHandler: precisaEstarLogado,
    schema: {
      tags: ['Veiculos'],
      summary: 'Lista os veículos do usuário logado',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          busca: { type: 'string', description: 'Filtra por placa, marca, modelo ou apelido' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const parametros = request.query as { busca?: string }
      const busca = parametros.busca

      // se usuário não digitar nada (busca opcional)volta a lista toda
      const filtro: Prisma.VeiculoWhereInput = { usuarioId: request.usuarioId }

      if (busca && busca.trim() !== '') {
        const termo = busca.trim()

        // procura mesmo termo em vários campos de uma vez e ignora maisc e minusc
        filtro.OR = [
          { placa: { contains: termo, mode: 'insensitive' } },
          { marca: { contains: termo, mode: 'insensitive' } },
          { modelo: { contains: termo, mode: 'insensitive' } },
          { apelido: { contains: termo, mode: 'insensitive' } }
        ]
      }

      const veiculos = await prisma.veiculo.findMany({
        where: filtro,
        orderBy: { criadoEm: 'desc' }
      })

      return reply.send(veiculos)
    } catch (error) {
      console.log(error)
      return reply.status(500).send({ erro: 'Erro ao buscar os veículos' })
    }
  })

  // um veiculo só (usado na tela de editar)
  app.get('/veiculos/:id', {
    preHandler: precisaEstarLogado,
    schema: {
      tags: ['Veiculos'],
      summary: 'Busca um veiculo pelo id',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } }
      }
    }
  }, async (request, reply) => {
    try {
      const parametros = request.params as { id: string }

      const veiculo = await prisma.veiculo.findUnique({
        where: { id: parametros.id }
      })

      if (!veiculo) {
        return reply.status(404).send({ erro: 'Veículo não encontrado' })
      }

      // só visualiza se o veiculo for desse usuario
      if (veiculo.usuarioId !== request.usuarioId) {
        return reply.status(403).send({ erro: 'Esse veículo não é seu' })
      }

      return reply.send(veiculo)
    } catch (error) {
      console.log(error)
      return reply.status(500).send({ erro: 'Erro ao buscar o veículo' })
    }
  })

  // cadastra veículo novo
  app.post('/veiculos', {
    preHandler: precisaEstarLogado,
    schema: {
      tags: ['Veiculos'],
      summary: 'Cadastra um veiculo',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['placa', 'renavam', 'chassi', 'marca', 'modelo'],
        properties: {
          placa: { type: 'string' },
          renavam: { type: 'string' },
          chassi: { type: 'string' },
          marca: { type: 'string' },
          modelo: { type: 'string' },
          anoFabricacao: { type: 'integer' },
          anoModelo: { type: 'integer' },
          cor: { type: 'string' },
          combustivel: { type: 'string' },
          tipo: { type: 'string' },
          apelido: { type: 'string' },
          fotoUrl: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const dados = request.body as DadosDoVeiculo

      // valida tudo antes de mandar pro db
      const erros = validarVeiculo(dados)
      if (erros.length > 0) {
        return reply.status(400).send({ erro: erros[0], erros: erros })
      }

      const placa = limparPlaca(dados.placa)

      // verifica se usuario já cadastrou essa placa
      const jaTem = await prisma.veiculo.findFirst({
        where: { usuarioId: request.usuarioId, placa: placa }
      })

      if (jaTem) {
        return reply.status(400).send({ erro: 'Você já cadastrou um veículo com essa placa' })
      }

      // ! pra o ts não reclamar
      const veiculo = await prisma.veiculo.create({
        data: {
          placa: placa,
          renavam: String(dados.renavam).replace(/\D/g, ''),
          chassi: String(dados.chassi).toUpperCase().trim(),
          marca: dados.marca!.trim(),
          modelo: dados.modelo!.trim(),
          anoFabricacao: Number(dados.anoFabricacao),
          anoModelo: Number(dados.anoModelo),
          cor: dados.cor!.trim(),
          combustivel: dados.combustivel!.trim(),
          tipo: dados.tipo!.trim(),
          apelido: dados.apelido ? dados.apelido.trim() : null,
          fotoUrl: dados.fotoUrl ? dados.fotoUrl : null,
          usuarioId: request.usuarioId
        }
      })

      return reply.status(201).send(veiculo)
    } catch (error) {
      console.log(error)
      return reply.status(500).send({ erro: 'Erro ao cadastrar o veículo' })
    }
  })

  // edita um veiculo
  app.put('/veiculos/:id', {
    preHandler: precisaEstarLogado,
    schema: {
      tags: ['Veiculos'],
      summary: 'Edita um veículo',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } }
      }
    }
  }, async (request, reply) => {
    try {
      const parametros = request.params as { id: string }
      const dados = request.body as DadosDoVeiculo

      const veiculo = await prisma.veiculo.findUnique({
        where: { id: parametros.id }
      })

      if (!veiculo) {
        return reply.status(404).send({ erro: 'Veículo não encontrado' })
      }

      if (veiculo.usuarioId !== request.usuarioId) {
        return reply.status(403).send({ erro: 'Esse veículo não é seu' })
      }

      const erros = validarVeiculo(dados)
      if (erros.length > 0) {
        return reply.status(400).send({ erro: erros[0], erros: erros })
      }

      const placa = limparPlaca(dados.placa)

      // se mudou a placa, não pode ser igual a outra placa do usuário
      if (placa !== veiculo.placa) {
        const outro = await prisma.veiculo.findFirst({
          where: { usuarioId: request.usuarioId, placa: placa }
        })
        if (outro) {
          return reply.status(400).send({ erro: 'Você já tem outro veículo com essa placa' })
        }
      }

      const atualizado = await prisma.veiculo.update({
        where: { id: veiculo.id },
        data: {
          placa: placa,
          renavam: String(dados.renavam).replace(/\D/g, ''),
          chassi: String(dados.chassi).toUpperCase().trim(),
          marca: dados.marca!.trim(),
          modelo: dados.modelo!.trim(),
          anoFabricacao: Number(dados.anoFabricacao),
          anoModelo: Number(dados.anoModelo),
          cor: dados.cor!.trim(),
          combustivel: dados.combustivel!.trim(),
          tipo: dados.tipo!.trim(),
          apelido: dados.apelido ? dados.apelido.trim() : null
        }
      })

      return reply.send(atualizado)
    } catch (error) {
      console.log(error)
      return reply.status(500).send({ erro: 'Erro ao salvar o veículo' })
    }
  })

  // exclui veiculo
  app.delete('/veiculos/:id', {
    preHandler: precisaEstarLogado,
    schema: {
      tags: ['Veiculos'],
      summary: 'Exclui um veículo',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } }
      }
    }
  }, async (request, reply) => {
    try {
      const parametros = request.params as { id: string }

      const veiculo = await prisma.veiculo.findUnique({
        where: { id: parametros.id }
      })

      if (!veiculo) {
        return reply.status(404).send({ erro: 'Veículo não encontrado' })
      }

      if (veiculo.usuarioId !== request.usuarioId) {
        return reply.status(403).send({ erro: 'Esse veículo não é seu' })
      }

      await prisma.veiculo.delete({
        where: { id: veiculo.id }
      })

      return reply.send({ mensagem: 'Veículo excluído' })
    } catch (error) {
      console.log(error)
      return reply.status(500).send({ erro: 'Erro ao excluir o veículo' })
    }
  })

  // recebe CRLV, manda pro gemini e deolve dados
  app.post('/veiculos/crlv', {
    preHandler: precisaEstarLogado,
    schema: {
      tags: ['Veiculos'],
      summary: 'Lê um CRLV com o Gemini e devolve os dados do veiculo',
      description: 'Enviar o arquivo em multipart/form-data no campo "arquivo". Aceita PDF, JPG, PNG e WEBP.',
      security: [{ bearerAuth: [] }],
      consumes: ['multipart/form-data']
    }
  }, async (request, reply) => {
    try {
      // pega o arquivo que veio no multipart
      const arquivo = await request.file()

      if (!arquivo) {
        return reply.status(400).send({ erro: 'Nenhum arquivo foi enviado' })
      }

      if (!TIPOS_ACEITOS.includes(arquivo.mimetype)) {
        return reply.status(400).send({ erro: 'Envie o CRLV em PDF, JPG, PNG ou WEBP' })
      }

      // transforma o arquivo em base64 pq é assim que o gemini aceita
      const conteudo = await arquivo.toBuffer()
      const base64 = conteudo.toString('base64')

      const dados = await lerCrlvComGemini(base64, arquivo.mimetype)

      // limpa traço que o gemini devolve
      if (dados.placa) {
        dados.placa = limparPlaca(dados.placa)
      }

      return reply.send({
        mensagem: 'CRLV lido com sucesso',
        nomeDoArquivo: arquivo.filename,
        dados: dados
      })
    } catch (error) {
      console.log(error)

      // aviso se IA está sobrecarregada
      if (error instanceof Error && error.message === 'GEMINI_OCUPADO') {
        return reply.status(503).send({
          erro: 'A IA está ocupada ou atingiu o limite de uso gratuito. Tente de novo mais tarde.'
        })
      }

      return reply.status(500).send({ erro: 'Não consegui ler esse CRLV. Tente outro arquivo ou preencha na mão.' })
    }
  })
}
