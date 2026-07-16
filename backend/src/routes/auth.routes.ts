import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";
import jwt from "jsonwebtoken";

const router = Router();

// Rotas de autenticacao da API: cadastro e login.

// Cadastro de usuario.
router.post("/register", async (req, res) => {
  try {
    // Le os campos enviados pelo frontend.
    const { nome, email, senha } = req.body;

    // Log de desenvolvimento para enxergar o payload recebido.
    console.log("Dados recebidos no backend:", { nome, email, senha });

    // Evita duplicar usuarios com o mesmo e-mail.
    const usuarioExistente = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (usuarioExistente) {
      return res.status(400).json({ erro: "Este e-mail já está cadastrado" });
    }

    // Gera hash antes de salvar a senha no banco.
    let hash = await bcrypt.hash(senha, 10);

    // Cria o usuario com a senha protegida.
    const novoUsuario = await prisma.user.create({
      data: {
        nome,
        email,
        senha: hash,
      },
    });

    // Devolve apenas dados publicos do usuario criado.
    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
      },
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

// Login de usuario.
router.post("/login", async (req, res) => {
  try {
    // Le credenciais enviadas pelo cliente.
    const { email, senha } = req.body;

    // Busca o usuario pelo e-mail.
    const usuarioExistente = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!usuarioExistente) {
      return res.status(400).json({ erro: "Usuário ou senha incorretos" });
    }

    // Compara a senha digitada com o hash salvo.
    const senhaValida = await bcrypt.compare(senha, usuarioExistente.senha);
    if (!senhaValida) {
      return res.status(400).json({ erro: "Usuário ou senha incorretos" });
    }

    // O token leva apenas o id do usuario e expira em 7 dias.
    const token = jwt.sign(
      { id: usuarioExistente.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );

    // Retorna o usuario e o token para o frontend.
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
