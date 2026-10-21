# Drivo

Plataforma onde o usuário monta a garagem dele: cadastra os veículos, pesquisa,
edita, exclui e importa o CRLV para a IA do Gemini preencher o formulário sozinha.

Teste de Desenvolvedor Fullstack Júnior (EPTA).

Protótipo no Figma: https://www.figma.com/design/kMDaB78808CbApQRhg8kVF/Untitled?node-id=1-833&t=HL0fcN1gkWiim6VF-1

---

## O que dá pra fazer

Criar conta, fazer login, ver a garagem, pesquisar por placa ou modelo,
cadastrar veículo, importar o CRLV e ter os dados preenchidos pela IA, editar,
excluir, alterar os dados cadastrais e a senha, e sair da conta.

## Stack

| Parte | O que usei |
| --- | --- |
| Front | Next.js 14 (App Router) + TypeScript + Tailwind |
| Back | Fastify 5 + TypeScript |
| Banco | PostgreSQL 16 + Prisma |
| Login | JWT + bcryptjs |
| IA | API gratuita do Google Gemini |
| Docs | OpenAPI com `@fastify/swagger` |
| Testes | Vitest |
| Infra | Docker + docker-compose |

---

## Como instalar e executar

Só precisa do Docker.

```bash
git clone <url-do-repositorio>
cd drivo-platform
cp .env.example .env
```

Abra o `.env` e coloque a chave do Gemini (gratuita em
https://aistudio.google.com/apikey):

```env
GEMINI_API_KEY="sua_chave_aqui"
```

Depois:

```bash
docker compose up --build
```

Ele sobe o banco, espera ficar pronto, aplica as migrations, roda o seed e sobe
a API e o site. A primeira vez demora alguns minutos.

| | |
| --- | --- |
| Site | http://localhost:3000 |
| API | http://localhost:3333 |
| Documentação | http://localhost:3333/docs |

O seed cria uma conta com os 5 veículos do Figma:

```
mariana.costa@email.com / drivo1234
```

> Sem a chave do Gemini tudo funciona, só a importação do CRLV que dá erro.
> A cota gratuita é de 20 requisições por dia por modelo; se estourar, dá pra
> trocar o `GEMINI_MODEL` no `.env`.

### Sem Docker

Precisa de Node 20+ e um PostgreSQL rodando.

```bash
cd backend && npm install && cp .env.example .env
# troque "banco" por "localhost" na DATABASE_URL
npx prisma migrate deploy && npm run seed && npm run dev

cd frontend && npm install && cp .env.example .env.local && npm run dev
```

## Como executar os testes

```bash
cd backend
npm test
```

São 27 testes das validações (e-mail, senha, placa, formulário) e da leitura da
resposta do Gemini. Dentro do Docker: `docker compose exec backend npm test`.

## Rotas

Todas documentadas em http://localhost:3333/docs.

`POST /auth/cadastro` · `POST /auth/login` · `GET|POST /veiculos` ·
`GET|PUT|DELETE /veiculos/:id` · `POST /veiculos/crlv` · `GET|PUT /perfil` ·
`PUT /perfil/senha`

O token vai no header `Authorization: Bearer <token>`.
