import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

import { jwtPublicKey } from "../config/jwt";

type JwtPayload = {
  sub: string;
  role: "USER" | "ADMIN";
  scope?: string;
  aud?: string;
  iss?: string;
};

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return reply.status(401).send({
      message: "Token não informado.",
    });
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return reply.status(401).send({
      message: "Token inválido.",
    });
  }

  try {
    const decoded = jwt.verify(token, jwtPublicKey, {
      algorithms: ["RS256"],
    }) as JwtPayload;

    request.user = {
      id: decoded.sub,
      role: decoded.role,
      scope: decoded.scope,
      aud: decoded.aud,
      iss: decoded.iss,
    };
  } catch {
    return reply.status(401).send({
      message: "Token inválido ou expirado.",
    });
  }
}