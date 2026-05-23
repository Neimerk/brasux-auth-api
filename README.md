# BrasUX Auth API

API de autenticação moderna, segura e escalável desenvolvida pela BrasUX.

Construída com:

- Fastify
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- Docker

---

# Tecnologias

- Node.js
- Fastify
- TypeScript
- Prisma
- PostgreSQL
- JWT
- Docker
- Swagger/OpenAPI

---

# Funcionalidades

- Cadastro de usuários
- Login com JWT
- Refresh Token
- Logout real
- Rotas protegidas
- Controle de permissões ADMIN
- Rate Limit
- Helmet Security
- CORS
- Swagger Docs
- Docker Compose

---

# Estrutura do Projeto

```txt
src/
 ├── lib/
 ├── middlewares/
 ├── modules/
 │    ├── auth/
 │    └── admin/
 ├── scripts/
 └── server.ts