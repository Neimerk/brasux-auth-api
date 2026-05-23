import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { v4 as uuid } from "uuid";

import { jwtPrivateKey } from "../../config/jwt";
import { AppError } from "../../errors/app-error";
import { prisma } from "../../lib/prisma";
import { createAuditLog } from "../audit/audit.service";

type UserRole = "USER" | "ADMIN";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
  clientId: string;
};

type ForgotPasswordInput = {
  email: string;
};

type ResetPasswordInput = {
  token: string;
  password: string;
};

function generateAccessToken(user: {
  id: string;
  role: UserRole;
  audience: string;
  scopes: string[];
}) {
  const jwtConfig: SignOptions = {
    expiresIn: "15m",
    algorithm: "RS256",
  };

  return jwt.sign(
    {
      role: user.role,
      aud: user.audience,
      scope: user.scopes.join(" "),
      iss: "brasux-auth-api",
    },
    jwtPrivateKey,
    {
      ...jwtConfig,
      subject: user.id,
    }
  );
}

async function createRefreshToken(userId: string) {
  const token = uuid();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const createdToken = await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
    select: {
      token: true,
    },
  });

  return createdToken.token;
}

async function getClientWithScopes(clientId: string) {
  const client = await prisma.clientApp.findUnique({
    where: {
      name: clientId,
    },
    include: {
      scopes: true,
    },
  });

  if (!client) {
    throw new AppError("Client inválido.", 401);
  }

  return client;
}

export async function registerUser({ name, email, password }: RegisterInput) {
  const userAlreadyExists = await prisma.user.findUnique({
    where: { email },
  });

  if (userAlreadyExists) {
    throw new AppError("Este e-mail já está em uso.", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  await createAuditLog({
    event: "REGISTER_SUCCESS",
    userId: user.id,
    email: user.email,
  });

  return user;
}

export async function loginUser({ email, password, clientId }: LoginInput) {
  const client = await getClientWithScopes(clientId);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    await createAuditLog({
      event: "LOGIN_FAILED",
      email,
      metadata: {
        reason: "USER_NOT_FOUND",
        clientId,
      },
    });

    throw new AppError("E-mail ou senha inválidos.", 401);
  }

  const passwordIsValid = await bcrypt.compare(password, user.password);

  if (!passwordIsValid) {
    await createAuditLog({
      event: "LOGIN_FAILED",
      userId: user.id,
      email: user.email,
      metadata: {
        reason: "INVALID_PASSWORD",
        clientId,
      },
    });

    throw new AppError("E-mail ou senha inválidos.", 401);
  }

  const scopes = client.scopes.map((scope) => scope.scope);

  const accessToken = generateAccessToken({
    id: user.id,
    role: user.role,
    audience: client.name,
    scopes,
  });

  const refreshToken = await createRefreshToken(user.id);

  await createAuditLog({
    event: "LOGIN_SUCCESS",
    userId: user.id,
    email: user.email,
    metadata: {
      clientId: client.name,
      scopes,
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    client: {
      id: client.id,
      name: client.name,
      scopes,
    },
  };
}

export async function refreshAccessToken(token: string) {
  const storedToken = await prisma.refreshToken.findUnique({
    where: {
      token,
    },
    include: {
      user: true,
    },
  });

  if (!storedToken || storedToken.revoked) {
    await createAuditLog({
      event: "TOKEN_REFRESH_FAILED",
      metadata: {
        reason: "INVALID_OR_REVOKED_TOKEN",
      },
    });

    throw new AppError("Refresh token inválido.", 401);
  }

  if (storedToken.expiresAt < new Date()) {
    await createAuditLog({
      event: "TOKEN_REFRESH_FAILED",
      userId: storedToken.userId,
      email: storedToken.user.email,
      metadata: {
        reason: "EXPIRED_TOKEN",
      },
    });

    throw new AppError("Refresh token expirado.", 401);
  }

  const defaultClient = await getClientWithScopes("notaon-ead");

  const scopes = defaultClient.scopes.map((scope) => scope.scope);

  const accessToken = generateAccessToken({
    id: storedToken.user.id,
    role: storedToken.user.role,
    audience: defaultClient.name,
    scopes,
  });

  await createAuditLog({
    event: "TOKEN_REFRESH_SUCCESS",
    userId: storedToken.user.id,
    email: storedToken.user.email,
    metadata: {
      clientId: defaultClient.name,
      scopes,
    },
  });

  return {
    accessToken,
  };
}

export async function logoutUser(token: string) {
  const storedToken = await prisma.refreshToken.findUnique({
    where: {
      token,
    },
    include: {
      user: true,
    },
  });

  if (!storedToken) {
    await createAuditLog({
      event: "LOGOUT_FAILED",
      metadata: {
        reason: "TOKEN_NOT_FOUND",
      },
    });

    throw new AppError("Refresh token inválido.", 401);
  }

  await prisma.refreshToken.update({
    where: {
      token,
    },
    data: {
      revoked: true,
    },
  });

  await createAuditLog({
    event: "LOGOUT_SUCCESS",
    userId: storedToken.userId,
    email: storedToken.user.email,
  });

  return {
    message: "Logout realizado com sucesso.",
  };
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError("Usuário não encontrado.", 404);
  }

  return user;
}

export async function forgotPassword({ email }: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    await createAuditLog({
      event: "PASSWORD_RESET_REQUEST_FAILED",
      email,
      metadata: {
        reason: "USER_NOT_FOUND",
      },
    });

    return {
      message:
        "Se este e-mail estiver cadastrado, enviaremos instruções para recuperação de senha.",
    };
  }

  const token = uuid();

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30);

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  await createAuditLog({
    event: "PASSWORD_RESET_REQUESTED",
    userId: user.id,
    email: user.email,
  });

  return {
    message:
      "Se este e-mail estiver cadastrado, enviaremos instruções para recuperação de senha.",
    resetToken: process.env.NODE_ENV === "production" ? undefined : token,
  };
}

export async function resetPassword({ token, password }: ResetPasswordInput) {
  const storedToken = await prisma.passwordResetToken.findUnique({
    where: {
      token,
    },
    include: {
      user: true,
    },
  });

  if (!storedToken || storedToken.used) {
    throw new AppError("Token de recuperação inválido.", 401);
  }

  if (storedToken.expiresAt < new Date()) {
    throw new AppError("Token de recuperação expirado.", 401);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: {
      id: storedToken.userId,
    },
    data: {
      password: passwordHash,
    },
  });

  await prisma.passwordResetToken.update({
    where: {
      token,
    },
    data: {
      used: true,
    },
  });

  await prisma.refreshToken.updateMany({
    where: {
      userId: storedToken.userId,
      revoked: false,
    },
    data: {
      revoked: true,
    },
  });

  await createAuditLog({
    event: "PASSWORD_RESET_SUCCESS",
    userId: storedToken.userId,
    email: storedToken.user.email,
  });

  return {
    message: "Senha redefinida com sucesso.",
  };
}