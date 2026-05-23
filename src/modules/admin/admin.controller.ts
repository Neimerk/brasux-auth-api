import type { FastifyReply, FastifyRequest } from "fastify";
import { listAuditLogs, listUsers } from "./admin.service";

export async function listUsersController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const users = await listUsers();

  return reply.status(200).send({
    users,
  });
}

export async function listAuditLogsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const logs = await listAuditLogs();

  return reply.status(200).send({
    logs,
  });
}