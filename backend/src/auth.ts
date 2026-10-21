import jwt from 'jsonwebtoken'
import { FastifyRequest, FastifyReply } from 'fastify'

// chave padrao pra não quebrar 
const SEGREDO = process.env.JWT_SECRET || 'segredo_do_drivo_dev'

type ConteudoDoToken = {
  id: string
}

// gera token com id do usuario dentro e valid de 7d
export function gerarToken(usuarioId: string): string {
  const token = jwt.sign({ id: usuarioId }, SEGREDO, { expiresIn: '7d' })
  return token
}

// roda antes das preHandler, lê o header Auth, confere token e guarda id do usuario
export async function precisaEstarLogado(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization

  if (!header) {
    return reply.status(401).send({ erro: 'Token não enviado' })
  }

  // tira espaço do header
  const partes = header.split(' ')
  if (partes.length !== 2) {
    return reply.status(401).send({ erro: 'Token em formato inválido' })
  }

  const token = partes[1]

  try {
    const dados = jwt.verify(token, SEGREDO) as ConteudoDoToken
    request.usuarioId = dados.id
  } catch (error) {
    console.log(error)
    return reply.status(401).send({ erro: 'Token inválido ou expirado' })
  }
}
