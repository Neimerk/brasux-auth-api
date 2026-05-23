import type { FastifyInstance } from "fastify";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { scopeMiddleware } from "../../middlewares/scope.middleware";

export async function testRoutes(app: FastifyInstance) {
  app.get(
    "/protected-scope",
    {
      preHandler: [
        authMiddleware,
        scopeMiddleware("courses:read"),
      ],
    },
    async () => {
      return {
        message: "Scope autorizado com sucesso.",
      };
    }
  );
}