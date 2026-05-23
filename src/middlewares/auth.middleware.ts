import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

type JwtPayload = {
  sub: string;
  role: "USER" | "ADMIN";
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

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return reply.status(500).send({
      message: "JWT_SECRET não configurado.",
    });
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;

    request.user = {
      id: decoded.sub,
      role: decoded.role,
    };
  } catch {
    return reply.status(401).send({
      message: "Token inválido ou expirado.",
    });
  }
}