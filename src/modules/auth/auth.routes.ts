import type { FastifyInstance } from "fastify";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  loginController,
  logoutController,
  meController,
  refreshController,
  registerController,
} from "./auth.controller";

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", registerController);
  app.post("/login", loginController);
  app.post("/refresh", refreshController);
  app.post("/logout", logoutController);

  app.get("/me", {
    preHandler: authMiddleware,
    handler: meController,
  });
}