import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";

type AuditLogInput = {
  event: string;
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Prisma.InputJsonValue;
};

export async function createAuditLog(data: AuditLogInput) {
  await prisma.auditLog.create({
    data,
  });
}