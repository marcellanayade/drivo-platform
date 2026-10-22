import { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import prisma from '../db'
import { precisaEstarLogado } from '../auth'
import { emailEhValido, senhaEhValida } from '../validacoes'
import { CorpoDoPerfil, CorpoDaSenha } from '../tipos'

// dados cadastrais do usuário 
export default async function rotasDePerfil(app: FastifyInstance) {
  // dados do usuário logado
  app.get('/perfil', {
    preHandler: precisaEstarLogado,
    schema: {
      tags: ['Perfil'],
      summary: 'Dados do usuário logado',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id: request.usuarioId }
      })

      if (!usuario) {
        return reply.status(404).send({ erro: 'Usuário não encontrado' })
      }

      // conta quantos veículos ele tem 
      const totalDeVeiculos = await prisma.veiculo.count({
        where: { usuarioId: usuario.id }
      })

      return reply.send({
        id: usuario.id,
        nome: usuario.nome,
        sobrenome: usuario.sobrenome,
        email: usuario.email,
        criadoEm: usuario.criadoEm,
        totalDeVeiculos: totalDeVeiculos
      })
    } catch (error) {
      console.log(error)
      return reply.status(500).send({ erro: 'Erro ao buscar o perfil' })
    }
  })

  // altera nome, sobrenome e email
  app.put('/perfil', {
    preHandler: precisaEstarLogado,
    schema: {
      tags: ['Perfil'],
      summary: 'Altera os dados cadastrais',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          nome: { type: 'string' },
          sobrenome: { type: 'string' },
          email: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const corpo = request.body as CorpoDoPerfil
      const nome = corpo.nome
      const sobrenome = corpo.sobrenome
      const email = corpo.email

      if (!nome || nome.trim() === '') {
        return reply.status(400).send({ erro: 'O nome é obrigatório' })
      }

      if (!emailEhValido(email)) {
        return reply.status(400).send({ erro: 'E-mail inválido' })
      }

      const emailLimpo = email.toLowerCase().trim()

      // verifica se não tem outra conta usando o email
      const outroUsuario = await prisma.usuario.findUnique({
        where: { email: emailLimpo }
      })

      if (outroUsuario && outroUsuario.id !== request.usuarioId) {
        return reply.status(400).send({ erro: 'Esse e-mail já está sendo usado' })
      }

      const usuario = await prisma.usuario.update({
        where: { id: request.usuarioId },
        data: {
          nome: nome.trim(),
          sobrenome: sobrenome ? sobrenome.trim() : '',
          email: emailLimpo
        }
      })

      return reply.send({
        id: usuario.id,
        nome: usuario.nome,
        sobrenome: usuario.sobrenome,
        email: usuario.email,
        criadoEm: usuario.criadoEm
      })
    } catch (error) {
      console.log(error)
      return reply.status(500).send({ erro: 'Erro ao salvar os dados' })
    }
  })

  // troca senha
  app.put('/perfil/senha', {
    preHandler: precisaEstarLogado,
    schema: {
      tags: ['Perfil'],
      summary: 'Altera a senha',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['senhaAtual', 'novaSenha'],
        properties: {
          senhaAtual: { type: 'string' },
          novaSenha: { type: 'string' },
          confirmarNovaSenha: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const corpo = request.body as CorpoDaSenha
      const senhaAtual = corpo.senhaAtual
      const novaSenha = corpo.novaSenha
      const confirmarNovaSenha = corpo.confirmarNovaSenha

      if (!senhaAtual || !novaSenha) {
        return reply.status(400).send({ erro: 'Preencha a senha atual e a nova senha' })
      }

      if (confirmarNovaSenha !== undefined && novaSenha !== confirmarNovaSenha) {
        return reply.status(400).send({ erro: 'As senhas não são iguais' })
      }

      if (!senhaEhValida(novaSenha)) {
        return reply.status(400).send({ erro: 'A nova senha precisa ter no mínimo 8 caracteres, com letras e números' })
      }

      const usuario = await prisma.usuario.findUnique({
        where: { id: request.usuarioId }
      })

      if (!usuario) {
        return reply.status(404).send({ erro: 'Usuário não encontrado' })
      }

      // confere se senha atual digitada está certa
      const senhaBate = await bcrypt.compare(senhaAtual, usuario.senha)

      if (!senhaBate) {
        return reply.status(400).send({ erro: 'A senha atual está incorreta' })
      }

      const novaSenhaCriptografada = await bcrypt.hash(novaSenha, 8)

      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { senha: novaSenhaCriptografada }
      })

      return reply.send({ mensagem: 'Senha alterada com sucesso' })
    } catch (error) {
      console.log(error)
      return reply.status(500).send({ erro: 'Erro ao alterar a senha' })
    }
  })
}
