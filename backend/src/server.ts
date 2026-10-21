import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

import rotasDeAuth from './routes/auth'
import rotasDeVeiculos from './routes/veiculos'
import rotasDePerfil from './routes/perfil'

const app = Fastify({ logger: true })

const PORTA = Number(process.env.PORT) || 3333

async function iniciarServidor() {
  // CORS só pro endereco do front
  const ORIGEM_DO_FRONT = process.env.CORS_ORIGIN || 'http://localhost:3000'
  await app.register(cors, { origin: ORIGEM_DO_FRONT })

  // plugin pra conseguir receber CRLV c limite de 10MB
  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 }
  })

  // documentação da API a partir dos schema de cada rota 
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Drivo API',
        description: 'API da plataforma Drivo, onde o usuario monta a garagem dele.',
        version: '1.0.0'
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    }
  })

  await app.register(swaggerUi, {
    routePrefix: '/docs'
  })

  // pra saber se a API está rodando
  app.get('/', {
    schema: {
      tags: ['Status'],
      summary: 'Diz se a API esta rodando'
    }
  }, async () => {
    return { status: 'ok', mensagem: 'API do Drivo rodando' }
  })

  await app.register(rotasDeAuth)
  await app.register(rotasDeVeiculos)
  await app.register(rotasDePerfil)

  try {
    // pra funcionar dentro do docker
    await app.listen({ port: PORTA, host: '0.0.0.0' })
    console.log('Servidor rodando na porta ' + PORTA)
    console.log('Documentacao em http://localhost:' + PORTA + '/docs')
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

iniciarServidor()
