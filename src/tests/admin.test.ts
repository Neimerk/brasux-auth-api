import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { app } from "../app";
import { prisma } from "../lib/prisma";

describe("Admin Routes", () => {
  const clientId = "notaon-ead";

  const userEmail = `user-${Date.now()}@brasux.com`;
  const adminEmail = `admin-${Date.now()}@brasux.com`;

  let userToken = "";
  let adminToken = "";

  beforeAll(async () => {
    await app.ready();

    const client = await prisma.clientApp.findUnique({
      where: {
        name: clientId,
      },
    });

    if (!client) {
      const createdClient = await prisma.clientApp.create({
        data: {
          name: clientId,
          description: "Plataforma EAD Curso NotaOn",
          secret: "test-secret",
        },
      });

      await prisma.clientScope.createMany({
        data: [
          {
            clientId: createdClient.id,
            scope: "courses:read",
            description: "Permissão para ler cursos",
          },
          {
            clientId: createdClient.id,
            scope: "lessons:complete",
            description: "Permissão para concluir aulas",
          },
        ],
        skipDuplicates: true,
      });
    }

    await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        name: "User Test",
        email: userEmail,
        password: "123456",
      },
    });

    await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        name: "Admin Test",
        email: adminEmail,
        password: "123456",
      },
    });

    await prisma.user.update({
      where: {
        email: adminEmail,
      },
      data: {
        role: "ADMIN",
      },
    });

    const userLogin = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: userEmail,
        password: "123456",
        clientId,
      },
    });

    const adminLogin = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: adminEmail,
        password: "123456",
        clientId,
      },
    });

    userToken = userLogin.json().accessToken;
    adminToken = adminLogin.json().accessToken;
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({
      where: {
        user: {
          email: {
            in: [userEmail, adminEmail],
          },
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [userEmail, adminEmail],
        },
      },
    });

    await app.close();
  });

  it("should block normal user from listing users", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/admin/users",
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });

    expect(response.statusCode).toBe(403);
  });

  it("should allow admin to list users", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/admin/users",
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body.users).toBeDefined();
    expect(Array.isArray(body.users)).toBe(true);
  });

  it("should block normal user from listing audit logs", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/admin/audit-logs",
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });

    expect(response.statusCode).toBe(403);
  });

  it("should allow admin to list audit logs", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/admin/audit-logs",
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body.logs).toBeDefined();
    expect(Array.isArray(body.logs)).toBe(true);
  });
});