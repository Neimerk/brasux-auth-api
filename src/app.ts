import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import { authRoutes } from "./modules/auth/auth.routes";
import { adminRoutes } from "./modules/admin/admin.routes";

export const app = Fastify({
  logger: false,
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
      description: "BrasUX Authentication API",
      version: "1.0.0",
    },
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

app.register(authRoutes, {
  prefix: "/auth",
});

app.register(adminRoutes, {
  prefix: "/admin",
});