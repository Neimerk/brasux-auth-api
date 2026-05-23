import type { FastifyReply, FastifyRequest } from "fastify";
import { listUsers } from "./admin.service";

export async function listUsersController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const users = await listUsers();

  return reply.status(200).send({
    users,
  });
}