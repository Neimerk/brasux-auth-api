import type { FastifyReply, FastifyRequest } from "fastify";

import { getJwks } from "./jwks.service";

export async function jwksController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  return reply.status(200).send(getJwks());
}