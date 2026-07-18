import type { Request, Response } from "express";
import { prisma } from "../prisma.js";
import { summarizeHabit } from "../lib/habit-metrics.js";
import { parseBody, parseId } from "../lib/http-validation.js";
import { habitSchema, habitToggleSchema } from "../lib/schemas.js";

/**
 * Cria um novo hábito para o usuário autenticado.
 */
export async function createHabit(req: Request, res: Response) {
  const body = parseBody(habitSchema, req.body, res);
  if (!body) return;

  try {
    const novoHabito = await prisma.habit.create({
      data: { nome: body.nome, userId: req.userId! },
    });
    return res.status(201).json(novoHabito);
  } catch {
    return res.status(500).json({ erro: "Não foi possível criar o hábito" });
  }
}

/**
 * Retorna todos os hábitos do usuário autenticado acompanhados de suas métricas consolidadas.
 */
export async function getHabits(req: Request, res: Response) {
  try {
    const habitos = await prisma.habit.findMany({
      where: { userId: req.userId! },
      include: {
        historico: {
          select: { dataConclusao: true },
          orderBy: { dataConclusao: "asc" },
        },
      },
      orderBy: { dataCriacao: "asc" },
    });

    // Formata o histórico calculando sequências de dias concluídos e cor de motivação
    return res.status(200).json(
      habitos.map(({ historico, ...habito }) => ({
        ...habito,
        ...summarizeHabit(
          historico.map((registro) => registro.dataConclusao),
        ),
      })),
    );
  } catch {
    return res.status(500).json({ erro: "Não foi possível carregar os hábitos" });
  }
}

/**
 * Alterna a conclusão de um hábito (marca ou desmarca) em uma data específica.
 */
export async function toggleHabit(req: Request, res: Response) {
  const body = parseBody(habitToggleSchema, req.body, res);
  if (!body) return;

  try {
    const habitId = body.id_habito;
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId: req.userId! },
      select: { id: true },
    });
    if (!habit) {
      return res.status(404).json({ erro: "Hábito não encontrado" });
    }

    const dataConclusao = new Date(`${body.data}T00:00:00.000Z`);
    const where = {
      habitId_dataConclusao: { habitId, dataConclusao },
    };
    const existing = await prisma.historicoHabito.findUnique({ where });
    const concluido = !existing;

    // Se já existe um registro, desmarca (remove). Caso contrário, marca (cria).
    if (existing) {
      await prisma.historicoHabito.delete({ where });
    } else {
      await prisma.historicoHabito.create({
        data: { habitId, dataConclusao },
      });
    }

    return res.status(200).json({
      id_habito: habitId,
      data: body.data,
      concluido,
    });
  } catch {
    return res.status(500).json({ erro: "Não foi possível atualizar o hábito" });
  }
}

/**
 * Exclui um hábito do usuário autenticado.
 */
export async function deleteHabit(req: Request, res: Response) {
  const id = parseId(req.params.id, res);
  if (!id) return;

  try {
    const result = await prisma.habit.deleteMany({
      where: { id, userId: req.userId! },
    });
    if (result.count === 0) {
      return res.status(404).json({ erro: "Hábito não encontrado" });
    }
    return res.status(204).send();
  } catch {
    return res.status(500).json({ erro: "Não foi possível excluir o hábito" });
  }
}

