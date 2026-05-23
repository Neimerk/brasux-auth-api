import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  getUserProfile,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "./auth.service";

const registerSchema = z.object({
  name: z.string().min(2, "Nome obrigatório."),
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "A senha precisa ter no mínimo 6 caracteres."),
});

const loginSchema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "Senha obrigatória."),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token obrigatório."),
});

export async function registerController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const data = registerSchema.parse(request.body);

    const user = await registerUser(data);

    return reply.status(201).send({
      message: "Usuário cadastrado com sucesso.",
      user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: "Erro de validação.",
        issues: error.issues,
      });
    }

    if (error instanceof Error) {
      return reply.status(400).send({
        message: error.message,
      });
    }

    return reply.status(500).send({
      message: "Erro interno no servidor.",
    });
  }
}

export async function loginController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const data = loginSchema.parse(request.body);

    const result = await loginUser(data);

    return reply.status(200).send({
      message: "Login realizado com sucesso.",
      ...result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: "Erro de validação.",
        issues: error.issues,
      });
    }

    if (error instanceof Error) {
      return reply.status(401).send({
        message: error.message,
      });
    }

    return reply.status(500).send({
      message: "Erro interno no servidor.",
    });
  }
}

export async function refreshController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { refreshToken } = refreshTokenSchema.parse(request.body);

    const result = await refreshAccessToken(refreshToken);

    return reply.status(200).send({
      message: "Access token renovado com sucesso.",
      ...result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: "Erro de validação.",
        issues: error.issues,
      });
    }

    if (error instanceof Error) {
      return reply.status(401).send({
        message: error.message,
      });
    }

    return reply.status(500).send({
      message: "Erro interno no servidor.",
    });
  }
}

export async function logoutController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { refreshToken } = refreshTokenSchema.parse(request.body);

    const result = await logoutUser(refreshToken);

    return reply.status(200).send(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: "Erro de validação.",
        issues: error.issues,
      });
    }

    if (error instanceof Error) {
      return reply.status(401).send({
        message: error.message,
      });
    }

    return reply.status(500).send({
      message: "Erro interno no servidor.",
    });
  }
}

export async function meController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    if (!request.user) {
      return reply.status(401).send({
        message: "Usuário não autenticado.",
      });
    }

    const user = await getUserProfile(request.user.id);

    return reply.status(200).send({
      user,
    });
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(404).send({
        message: error.message,
      });
    }

    return reply.status(500).send({
      message: "Erro interno no servidor.",
    });
  }
}