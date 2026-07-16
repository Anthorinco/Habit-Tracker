import { Request, Response } from "express";
import { prisma } from "../prisma.js";

// Cria um novo habito para o usuario autenticado.
export async function createHabit(req: Request, res: Response) {
  try {
    // Nome enviado pelo frontend.
    const { nome } = req.body;
    // id do usuario injetado pelo middleware de auth.
    const userId = req.userId;

    // Nome vazio nao faz sentido aqui.
    if (!nome) {
      return res.status(400).json({ mensagem: "Nome do habito é obrigatório" });
    }

    // Sem usuario autenticado nao da para salvar o habito.
    if (!userId) {
      return res.status(401).json({ mensagem: "Usuário não autenticado ou inválido" });
    }

    // Salva o habito ligado ao dono certo.
    const novoHabito = await prisma.habit.create({
      data: {
        nome,
        userId,
      },
    });

    return res.status(201).json(novoHabito);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
}

// Busca apenas os habitos do usuario autenticado.
export async function getHabits(req: Request, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ mensagem: "Usuário não autenticado ou inválido" });
    }

    const habitos = await prisma.habit.findMany({
      where: {
        userId,
      },
    });

    return res.status(200).json(habitos);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
}

// Remove um habito somente se ele pertencer ao usuario logado.
export async function deleteHabit(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const idNum = Number(id);

    // Protege contra ids que nao viraram numero.
    if (isNaN(idNum)) {
      return res.status(400).json({ mensagem: "Id do hábito inválido" });
    }

    // O parametro precisa existir antes de seguir.
    if (!id) {
      return res.status(400).json({ mensagem: "Id do habito é obrigatório" });
    }

    if (!userId) {
      return res.status(401).json({ mensagem: "Usuário não autenticado ou inválido" });
    }

    // Garante que a exclusao so afete o dono do registro.
    const resultado = await prisma.habit.deleteMany({
      where: {
        id: idNum,
        userId,
      },
    });

    if (resultado.count === 0) {
      return res.status(404).json({ mensagem: "Habito não encontrado ou não é seu" });
    }

    return res.status(200).json({ mensagem: "Habito excluído com sucesso" });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
}
