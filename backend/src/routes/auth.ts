import { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import prisma from '../db'
import { gerarToken } from '../auth'
import { emailEhValido, senhaEhValida } from '../validacoes'
import { CorpoDoCadastro, CorpoDoLogin } from '../tipos'

//cadastro e login
export default async function rotasDeAuth(app: FastifyInstance) {
  // cria a conta e devolve o token
  app.post('/auth/cadastro', {
    schema: {
      tags: ['Autenticacao'],
      summary: 'Cria uma conta nova',
      body: {
        type: 'object',
        required: ['nomeCompleto', 'email', 'senha'],
        properties: {
          nomeCompleto: { type: 'string' },
          email: { type: 'string' },
          senha: { type: 'string' },
          confirmarSenha: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      // pega dados do body
      const corpo = request.body as CorpoDoCadastro
      const nomeCompleto = corpo.nomeCompleto
      const email = corpo.email
      const senha = corpo.senha
      const confirmarSenha = corpo.confirmarSenha

      // validações
      if (!nomeCompleto || nomeCompleto.trim().length < 3) {
        return reply.status(400).send({ erro: 'Digite seu nome completo' })
      }

      if (!emailEhValido(email)) {
        return reply.status(400).send({ erro: 'E-mail inválido' })
      }

      if (!senhaEhValida(senha)) {
        return reply.status(400).send({ erro: 'A senha precisa ter no mínimo 8 caracteres, com letras e números' })
      }

      if (confirmarSenha !== undefined && senha !== confirmarSenha) {
        return reply.status(400).send({ erro: 'As senhas não são iguais' })
      }

      // Verifica se ja existe alguem com esse email
      const jaExiste = await prisma.usuario.findUnique({
        where: { email: email.toLowerCase().trim() }
      })

      if (jaExiste) {
        return reply.status(400).send({ erro: 'Esse e-mail já está cadastrado' })
      }

      // usuario digita nome completo em um campo e primeira palavra vira nome e o resto o sobrenome
      const pedacosDoNome = nomeCompleto.trim().split(' ')
      const nome = pedacosDoNome[0]
      let sobrenome = ''
      if (pedacosDoNome.length > 1) {
        sobrenome = pedacosDoNome.slice(1).join(' ')
      }

      // gera hash da senha
      const senhaCriptografada = await bcrypt.hash(senha, 8)

      const usuario = await prisma.usuario.create({
        data: {
          nome: nome,
          sobrenome: sobrenome,
          email: email.toLowerCase().trim(),
          senha: senhaCriptografada
        }
      })

      const token = gerarToken(usuario.id)

      return reply.status(201).send({
        token: token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          sobrenome: usuario.sobrenome,
          email: usuario.email,
          criadoEm: usuario.criadoEm
        }
      })
    } catch (error) {
      console.log(error)
      return reply.status(500).send({ erro: 'Erro ao criar a conta' })
    }
  })

  //confere email e senha e devolve token
  app.post('/auth/login', {
    schema: {
      tags: ['Autenticacao'],
      summary: 'Entra na conta',
      body: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
          email: { type: 'string' },
          senha: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const corpo = request.body as CorpoDoLogin
      const email = corpo.email
      const senha = corpo.senha

      if (!email || !senha) {
        return reply.status(400).send({ erro: 'Preencha o e-mail e a senha' })
      }

      // verifica se usuario existe no db
      const usuario = await prisma.usuario.findUnique({
        where: { email: String(email).toLowerCase().trim() }
      })

      if (!usuario) {
        // não dizer se o email existe ou não
        return reply.status(401).send({ erro: 'E-mail ou senha incorretos' })
      }

      // compara a senha digitada com o hash salvo
      const senhaBate = await bcrypt.compare(senha, usuario.senha)

      if (!senhaBate) {
        return reply.status(401).send({ erro: 'E-mail ou senha incorretos' })
      }

      const token = gerarToken(usuario.id)

      return reply.send({
        token: token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          sobrenome: usuario.sobrenome,
          email: usuario.email,
          criadoEm: usuario.criadoEm
        }
      })
    } catch (error) {
      console.log(error)
      return reply.status(500).send({ erro: 'Erro ao fazer login' })
    }
  })
}
