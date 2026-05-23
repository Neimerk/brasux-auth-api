import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AppError } from "./app-error";

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error);

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      message: error.message,
    });
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Erro de validação.",
      issues: error.issues,
    });
  }

  return reply.status(500).send({
    message: "Erro interno no servidor.",
  });
}