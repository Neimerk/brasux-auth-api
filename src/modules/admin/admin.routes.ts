import type { FastifyInstance } from "fastify";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";
import { listUsersController } from "./admin.controller";

export async function adminRoutes(app: FastifyInstance) {
  app.get("/users", {
    preHandler: [authMiddleware, roleMiddleware("ADMIN")],
    handler: listUsersController,
  });
}