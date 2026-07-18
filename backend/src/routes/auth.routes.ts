import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";
import { parseBody } from "../lib/http-validation.js";
import { loginSchema, registerSchema } from "../lib/schemas.js";

const router = Router();

/**
 * Endpoint de Registro: Cadastra um novo usuário criptografando a senha.
 */
router.post("/register", async (req, res) => {
  const body = parseBody(registerSchema, req.body, res);
  if (!body) return;

  try {
    const usuarioExistente = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (usuarioExistente) {
      return res.status(409).json({ erro: "Este e-mail já está cadastrado" });
    }

    // Criptografa a senha do usuário com 10 rounds do bcrypt
    const hash = await bcrypt.hash(body.senha, 10);
    const novoUsuario = await prisma.user.create({
      data: { nome: body.nome, email: body.email, senha: hash },
    });

    return res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
      },
    });
  } catch {
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

/**
 * Endpoint de Login: Valida credenciais e gera um token JWT de acesso (válido por 7 dias).
 */
router.post("/login", async (req, res) => {
  const body = parseBody(loginSchema, req.body, res);
  if (!body) return;

  try {
    const usuario = await prisma.user.findUnique({
      where: { email: body.email },
    });
    if (!usuario || !(await bcrypt.compare(body.senha, usuario.senha))) {
      return res.status(401).json({ erro: "Usuário ou senha incorretos" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ erro: "Autenticação não configurada" });
    }

    // Gera o token JWT para o usuário logado
    const token = jwt.sign({ id: usuario.id }, secret, { expiresIn: "7d" });
    return res.status(200).json({
      mensagem: "Usuário logado com sucesso!",
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
      token,
    });
  } catch {
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

export default router;

