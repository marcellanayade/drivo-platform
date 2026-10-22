import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

// cria um usuário de teste com os mesmos veículos do figma
const prisma = new PrismaClient()

const EMAIL_DO_DEMO = 'mariana.costa@email.com'
const SENHA_DO_DEMO = 'drivo1234'

// formato de cada veículo 
type VeiculoDoSeed = {
  placa: string
  renavam: string
  chassi: string
  marca: string
  modelo: string
  anoFabricacao: number
  anoModelo: number
  cor: string
  combustivel: string
  tipo: string
  apelido: string | null
  fotoUrl: string
  criadoEm: Date
}

//fotos na pasta public do front, entã aqui só tem o caminho
const veiculosDoDemo: VeiculoDoSeed[] = [
  {
    placa: 'RTX4B21',
    renavam: '01234567890',
    chassi: '9BRBC3E31P1234821',
    marca: 'Toyota',
    modelo: 'Corolla Altis Hybrid',
    anoFabricacao: 2022,
    anoModelo: 2023,
    cor: 'Prata',
    combustivel: 'Híbrido',
    tipo: 'Automóvel',
    apelido: 'Carro da família',
    fotoUrl: '/images/corolla.jpg',
    criadoEm: new Date('2026-03-14T09:00:00')
  },
  {
    placa: 'QPL8C34',
    renavam: '13579246801',
    chassi: '93HRV2E58R5670193',
    marca: 'Honda',
    modelo: 'HR-V EXL Turbo',
    anoFabricacao: 2023,
    anoModelo: 2024,
    cor: 'Preto',
    combustivel: 'Flex',
    tipo: 'Automóvel',
    apelido: null,
    fotoUrl: '/images/hrv.jpg',
    criadoEm: new Date('2026-03-13T09:00:00')
  },
  {
    placa: 'FHD2E09',
    renavam: '11223344556',
    chassi: '9BWAB45U4MT007740',
    marca: 'Volkswagen',
    modelo: 'Polo Highline TSI',
    anoFabricacao: 2021,
    anoModelo: 2022,
    cor: 'Branco',
    combustivel: 'Flex',
    tipo: 'Automóvel',
    apelido: null,
    fotoUrl: '/images/polo.jpg',
    criadoEm: new Date('2026-03-12T09:00:00')
  },
  {
    placa: 'GBN7A55',
    renavam: '98765432109',
    chassi: '988226TFXM1013312',
    marca: 'Fiat',
    modelo: 'Toro Volcano Diesel',
    anoFabricacao: 2022,
    anoModelo: 2022,
    cor: 'Cinza',
    combustivel: 'Diesel',
    tipo: 'Caminhonete',
    apelido: null,
    fotoUrl: '/images/toro.jpg',
    criadoEm: new Date('2026-03-11T09:00:00')
  },
  {
    placa: 'MXR1J78',
    renavam: '55667788990',
    chassi: '9C6RH2300L0005521',
    marca: 'Yamaha',
    modelo: 'MT-03 ABS',
    anoFabricacao: 2020,
    anoModelo: 2021,
    cor: 'Azul',
    combustivel: 'Gasolina',
    tipo: 'Motocicleta',
    apelido: null,
    fotoUrl: '/images/mt03.jpg',
    criadoEm: new Date('2026-03-10T09:00:00')
  }
]

async function rodarSeed() {
  // verifica se usuáerio demo existe pra não duplicar
  let usuario = await prisma.usuario.findUnique({
    where: { email: EMAIL_DO_DEMO }
  })

  if (!usuario) {
    const senhaCriptografada = await bcrypt.hash(SENHA_DO_DEMO, 8)

    usuario = await prisma.usuario.create({
      data: {
        nome: 'Mariana',
        sobrenome: 'Costa',
        email: EMAIL_DO_DEMO,
        senha: senhaCriptografada,
        criadoEm: new Date('2026-03-01T10:00:00')
      }
    })
    console.log('Usuário demo criado')
  } else {
    console.log('Usuário demo já existia')
  }

  // veiíulos, um por um
  for (let i = 0; i < veiculosDoDemo.length; i++) {
    const dados = veiculosDoDemo[i]

    const jaTem = await prisma.veiculo.findFirst({
      where: { usuarioId: usuario.id, placa: dados.placa }
    })

    if (jaTem) {
      console.log('Veiculo ' + dados.placa + ' ja existia')
    } else {
      await prisma.veiculo.create({
        data: {
          placa: dados.placa,
          renavam: dados.renavam,
          chassi: dados.chassi,
          marca: dados.marca,
          modelo: dados.modelo,
          anoFabricacao: dados.anoFabricacao,
          anoModelo: dados.anoModelo,
          cor: dados.cor,
          combustivel: dados.combustivel,
          tipo: dados.tipo,
          apelido: dados.apelido,
          fotoUrl: dados.fotoUrl,
          criadoEm: dados.criadoEm,
          usuarioId: usuario.id
        }
      })
      console.log('Veiculo ' + dados.placa + ' criado')
    }
  }

  console.log('')
  console.log('Seed terminado. Pra entrar no sistema use:')
  console.log('E-mail: ' + EMAIL_DO_DEMO)
  console.log('Senha: ' + SENHA_DO_DEMO)
}

rodarSeed()
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
