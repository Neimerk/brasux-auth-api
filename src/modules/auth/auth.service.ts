import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { v4 as uuid } from "uuid";

import { AppError } from "../../errors/app-error";
import { prisma } from "../../lib/prisma";

type UserRole = "USER" | "ADMIN";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

function generateAccessToken(user: { id: string; role: UserRole }) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError("JWT_SECRET não configurado.", 500);
  }

  const jwtConfig: SignOptions = {
    expiresIn: "15m",
  };

  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    secret,
    jwtConfig
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

  return user;
}

export async function loginUser({ email, password }: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("E-mail ou senha inválidos.", 401);
  }

  const passwordIsValid = await bcrypt.compare(password, user.password);

  if (!passwordIsValid) {
    throw new AppError("E-mail ou senha inválidos.", 401);
  }

  const accessToken = generateAccessToken({
    id: user.id,
    role: user.role,
  });

  const refreshToken = await createRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
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
    throw new AppError("Refresh token inválido.", 401);
  }

  if (storedToken.expiresAt < new Date()) {
    throw new AppError("Refresh token expirado.", 401);
  }

  const accessToken = generateAccessToken({
    id: storedToken.user.id,
    role: storedToken.user.role,
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
  });

  if (!storedToken) {
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