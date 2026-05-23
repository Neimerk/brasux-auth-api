import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { AppError } from "../../errors/app-error";
import {
  forgotPassword,
  getUserProfile,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resetPassword,
} from "./auth.service";

const registerSchema = z.object({
  name: z.string().min(2, "Nome obrigatório."),
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "A senha precisa ter no mínimo 6 caracteres."),
});

const loginSchema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "Senha obrigatória."),
  clientId: z.string().min(1, "Client ID obrigatório."),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token obrigatório."),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido."),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token obrigatório."),
  password: z
    .string()
    .min(6, "A nova senha precisa ter no mínimo 6 caracteres."),
});

export async function registerController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const data = registerSchema.parse(request.body);

  const user = await registerUser(data);

  return reply.status(201).send({
    message: "Usuário cadastrado com sucesso.",
    user,
  });
}

export async function loginController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const data = loginSchema.parse(request.body);

  const result = await loginUser(data);

  return reply.status(200).send({
    message: "Login realizado com sucesso.",
    ...result,
  });
}

export async function refreshController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { refreshToken } = refreshTokenSchema.parse(request.body);

  const result = await refreshAccessToken(refreshToken);

  return reply.status(200).send({
    message: "Access token renovado com sucesso.",
    ...result,
  });
}

export async function logoutController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { refreshToken } = refreshTokenSchema.parse(request.body);

  const result = await logoutUser(refreshToken);

  return reply.status(200).send(result);
}

export async function forgotPasswordController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const data = forgotPasswordSchema.parse(request.body);

  const result = await forgotPassword(data);

  return reply.status(200).send(result);
}

export async function resetPasswordController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const data = resetPasswordSchema.parse(request.body);

  const result = await resetPassword(data);

  return reply.status(200).send(result);
}

export async function meController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (!request.user) {
    throw new AppError("Usuário não autenticado.", 401);
  }

  const user = await getUserProfile(request.user.id);

  return reply.status(200).send({
    user,
  });
}