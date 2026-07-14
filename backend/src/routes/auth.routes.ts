import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";
import jwt from "jsonwebtoken";

const router = Router();

// Nossa primeira rota: Cadastro de Usuários (POST)
router.post("/register", async (req, res) => {
  try {
    // Pegando os dados enviados pelo corpo da requisição (body)
    const { nome, email, senha } = req.body;

    // 1. Validar visualmente se os dados estão chegando no terminal do servidor
    console.log("Dados recebidos no backend:", { nome, email, senha });

    const usuarioExistente = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (usuarioExistente) {
      return res.status(400).json({ erro: "Este e-mail já está cadastrado" });
    }
    let hash = await bcrypt.hash(senha, 10);
    // 2. Responder temporariamente ao cliente para não deixar a requisição travada
    const novoUsuario = await prisma.user.create({
      data: {
        nome,
        email,
        senha: hash,
      },
    });

    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
      },
    });
  } catch (error) {
    // Se acontecer um erro bizarro no servidor, responde com status 500 (Internal Server Error)
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

// Login de usuarios
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuarioExistente = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!usuarioExistente) {
      return res.status(400).json({ erro: "Usuário ou senha incorretos" });
    }
    const senhaValida = await bcrypt.compare(senha, usuarioExistente.senha);
    if (!senhaValida) {
      return res.status(400).json({ erro: "Usuário ou senha incorretos" });
    }

   const token = jwt.sign(
  { id: usuarioExistente.id }, // Payload
  process.env.JWT_SECRET as string, // Chave Secreta
  { expiresIn: "7d" } // Opções de expiração
);

    res.status(200).json({
      mensagem: "Usuário logado com sucesso!",
      usuario: {
        id: usuarioExistente.id,
        nome: usuarioExistente.nome,
        email: usuarioExistente.email,
      },
      token: token,
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

export default router;
