import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { app } from "../app";
import { prisma } from "../lib/prisma";

describe("Auth Flow", () => {
  const testUser = {
    name: "Usuário Teste",
    email: `teste-${Date.now()}@brasux.com`,
    password: "123456",
  };

  let accessToken = "";
  let refreshToken = "";

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
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

  it("should register a new user", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: testUser,
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();

    expect(body.user.email).toBe(testUser.email);
    expect(body.user.password).toBeUndefined();
  });

  it("should login user and return tokens", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: testUser.email,
        password: testUser.password,
      },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();

    accessToken = body.accessToken;
    refreshToken = body.refreshToken;

    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();
    expect(body.user.email).toBe(testUser.email);
  });

  it("should access authenticated profile", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body.user.email).toBe(testUser.email);
  });

  it("should refresh access token", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/refresh",
      payload: {
        refreshToken,
      },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body.accessToken).toBeTruthy();
  });

  it("should logout user", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/logout",
      payload: {
        refreshToken,
      },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body.message).toBe("Logout realizado com sucesso.");
  });

  it("should not refresh token after logout", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/refresh",
      payload: {
        refreshToken,
      },
    });

    expect(response.statusCode).toBe(401);
  });
});