import type { FastifyInstance } from "fastify";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  forgotPasswordController,
  loginController,
  logoutController,
  meController,
  refreshController,
  registerController,
  resetPasswordController,
} from "./auth.controller";

import { jwksController } from "./jwks.controller";

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", registerController);
  app.post("/login", {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: "1 minute",
      },
    },
    handler: loginController,
  });

  app.post("/refresh", refreshController);
  app.post("/logout", logoutController);

  app.post("/forgot-password", forgotPasswordController);
  app.post("/reset-password", resetPasswordController);

  app.get("/me", {
    preHandler: authMiddleware,
    handler: meController,
  });
  app.get("/.well-known/jwks.json", jwksController);
}