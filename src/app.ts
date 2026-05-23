import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { errorHandler } from "./errors/error-handler";
import { loggerPlugin } from "./plugins/logger";

import { authRoutes } from "./modules/auth/auth.routes";
import { adminRoutes } from "./modules/admin/admin.routes";
import { testRoutes } from "./modules/test/test.routes";

export const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === "test" ? "silent" : "info",
  },
  genReqId: () => crypto.randomUUID(),
});

app.setErrorHandler(errorHandler);

app.register(loggerPlugin);
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
      description: "BrasUX Authentication API",
      version: "1.0.0",
    },

    servers: [
      {
        url: "http://localhost:3333",
        description: "Local server",
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

    security: [
      {
        bearerAuth: [],
      },
    ],
  },
});

app.register(swaggerUi, {
  routePrefix: "/docs",
});

app.get("/health", async () => {
  return {
    status: "ok",
  };
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
            color: #cbd5e1;
            font-size: 18px;
            line-height: 1.7;
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
          }

          .item small {
            color: #94a3b8;
          }

          .status {
            margin-top: 32px;
            color: #86efac;
            font-weight: 700;
          }

          .actions {
            margin-top: 28px;
          }

          .actions a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 14px 22px;
            border-radius: 14px;
            background: linear-gradient(135deg, #2563eb, #38bdf8);
            color: white;
            text-decoration: none;
            font-weight: 700;
            transition: 0.2s ease;
            box-shadow: 0 10px 30px rgba(37, 99, 235, 0.35);
          }

          .actions a:hover {
            transform: translateY(-2px);
            opacity: 0.95;
          }
            
          @media (max-width: 700px) {
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

          <section class="grid">
            <div class="item">
              <strong>JWT RS256</strong>
              <small>Sessões seguras via Bearer Token</small>
            </div>

            <div class="item">
              <strong>JWKS</strong>
              <small>Validação distribuída por chave pública</small>
            </div>

            <div class="item">
              <strong>IAM</strong>
              <small>Clients, scopes, roles e audit logs</small>
            </div>
          </section>

          <div class="status">● API online e operacional</div>

          <div class="actions">
            <a href="/docs" target="_blank">
              Acessar documentação
            </a>
          </div>

        </main>
      </body>
    </html>
  `);
});

app.register(authRoutes, {
  prefix: "/auth",
});

app.register(adminRoutes, {
  prefix: "/admin",
});

app.register(testRoutes, {
  prefix: "/test",
});