import Fastify from "fastify";
import "dotenv/config";

import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";

import { authRoutes } from "./modules/auth/auth.routes";
import { adminRoutes } from "./modules/admin/admin.routes";

const app = Fastify({
  logger: true,
});

app.register(helmet);

app.register(cors, {
  origin: true,
  credentials: true,
});

app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

app.register(swagger, {
  openapi: {
    info: {
      title: "BrasUX Auth API",
      description:
        "API de autenticação segura da BrasUX com Fastify, Prisma, PostgreSQL e JWT.",
      version: "1.0.0",
    },

    tags: [
      {
        name: "Health",
        description: "Status da API",
      },
      {
        name: "Auth",
        description: "Autenticação e usuários",
      },
      {
        name: "Admin",
        description: "Rotas administrativas",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
});

app.register(swaggerUi, {
  routePrefix: "/docs",
});

app.get("/", async (_, reply) => {
  return reply.type("text/html").send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>BrasUX Auth API</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            min-height: 100vh;
            font-family: Arial, Helvetica, sans-serif;
            background:
              radial-gradient(circle at top left, #2563eb 0, transparent 35%),
              linear-gradient(135deg, #020617, #0f172a);
            color: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }

          .card {
            width: 100%;
            max-width: 760px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 28px;
            padding: 42px;
            background: rgba(15, 23, 42, 0.78);
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
            backdrop-filter: blur(18px);
          }

          .badge {
            display: inline-flex;
            padding: 8px 14px;
            border-radius: 999px;
            background: rgba(37, 99, 235, 0.18);
            color: #93c5fd;
            font-weight: 700;
            font-size: 13px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          h1 {
            margin: 24px 0 12px;
            font-size: clamp(42px, 7vw, 76px);
            line-height: 0.95;
            letter-spacing: -0.06em;
          }

          h1 span {
            color: #38bdf8;
          }

          p {
            margin: 0;
            max-width: 620px;
            color: #cbd5e1;
            font-size: 18px;
            line-height: 1.7;
          }

          .actions {
            margin-top: 28px;
          }

          .docsButton {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 14px 22px;
            border-radius: 16px;
            background: linear-gradient(135deg, #2563eb, #38bdf8);
            color: white;
            text-decoration: none;
            font-weight: 700;
            font-size: 15px;
            transition: all 0.25s ease;
            box-shadow:
              0 10px 30px rgba(37, 99, 235, 0.35),
              inset 0 1px 0 rgba(255,255,255,0.15);
          }

          .docsButton:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow:
              0 18px 40px rgba(56, 189, 248, 0.35),
              inset 0 1px 0 rgba(255,255,255,0.2);
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
            margin-top: 32px;
          }

          .item {
            padding: 18px;
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.08);
          }

          .item strong {
            display: block;
            margin-bottom: 6px;
            color: #fff;
          }

          .item small {
            color: #94a3b8;
          }

          .status {
            margin-top: 32px;
            display: flex;
            align-items: center;
            gap: 10px;
            color: #86efac;
            font-weight: 700;
          }

          .dot {
            width: 10px;
            height: 10px;
            border-radius: 999px;
            background: #22c55e;
            box-shadow: 0 0 22px #22c55e;
          }

          @media (max-width: 700px) {
            .card {
              padding: 28px;
            }

            .grid {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>

      <body>
        <main class="card">
          <div class="badge">BrasUX Technology</div>

          <h1>BrasUX <span>Auth</span> API</h1>

          <p>
            Infraestrutura de autenticação segura, moderna e escalável para produtos digitais,
            sistemas internos e aplicações comerciais da BrasUX.
          </p>

          <div class="actions">
            <a href="/docs" class="docsButton">
              Acessar documentação
            </a>
          </div>

          <section class="grid">
            <div class="item">
              <strong>JWT</strong>
              <small>Sessões seguras via Bearer Token</small>
            </div>

            <div class="item">
              <strong>Prisma</strong>
              <small>Banco tipado com PostgreSQL</small>
            </div>

            <div class="item">
              <strong>Fastify</strong>
              <small>API rápida com TypeScript</small>
            </div>
          </section>

          <div class="status">
            <span class="dot"></span>
            API online e operacional
          </div>
        </main>
      </body>
    </html>
  `);
});

app.get("/health", async () => {
  return {
    status: "ok",
    service: "brasux-auth-api",
    message: "API de autenticação BrasUX rodando com sucesso",
  };
});

app.register(authRoutes, {
  prefix: "/auth",
});

app.register(adminRoutes, {
  prefix: "/admin",
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3333;

    await app.listen({
      port,
      host: "0.0.0.0",
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();