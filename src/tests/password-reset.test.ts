import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { app } from "../app";
import { prisma } from "../lib/prisma";

describe("Password Reset Flow", () => {
  const clientId = "notaon-ead";

  const testUser = {
    name: "Password Reset User",
    email: `password-reset-${Date.now()}@brasux.com`,
    password: "123456",
    newPassword: "654321",
  };

  let resetToken = "";

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
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
      },
    });
  });

  afterAll(async () => {
    await prisma.passwordResetToken.deleteMany({
      where: {
        user: {
          email: testUser.email,
        },
      },
    });

    await prisma.refreshToken.deleteMany({
      where: {
        user: {
          email: testUser.email,
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: testUser.email,
      },
    });

    await app.close();
  });

  it("should request password reset", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/forgot-password",
      payload: {
        email: testUser.email,
      },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body.message).toBe(
      "Se este e-mail estiver cadastrado, enviaremos instruções para recuperação de senha."
    );

    expect(body.resetToken).toBeTruthy();

    resetToken = body.resetToken;
  });

  it("should reset password with valid token", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/reset-password",
      payload: {
        token: resetToken,
        password: testUser.newPassword,
      },
    });

    expect(response.statusCode).toBe(200);

    expect(response.json()).toEqual({
      message: "Senha redefinida com sucesso.",
    });
  });

  it("should login with new password", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: testUser.email,
        password: testUser.newPassword,
        clientId,
      },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body.accessToken).toBeTruthy();
    expect(body.refreshToken).toBeTruthy();
    expect(body.client.name).toBe(clientId);
  });

  it("should not reuse reset token", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/reset-password",
      payload: {
        token: resetToken,
        password: "nova123",
      },
    });

    expect(response.statusCode).toBe(401);
  });

  it("should not reset password with invalid token", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/reset-password",
      payload: {
        token: "invalid-token",
        password: "nova123",
      },
    });

    expect(response.statusCode).toBe(401);
  });
});