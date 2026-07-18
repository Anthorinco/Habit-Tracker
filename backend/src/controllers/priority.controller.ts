import type { Request, Response } from "express";
import { prisma } from "../prisma.js";
import { parseBody, parseId } from "../lib/http-validation.js";
import { prioritySchema, prioritySettingsSchema } from "../lib/schemas.js";

/**
 * Carrega a preferência de limpar prioridades no fim da semana do usuário autenticado.
 */
export async function getPrioritySettings(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { limparPrioridadesNoFimDaSemana: true },
    });
    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }
    return res.status(200).json({
      limparNoFimDaSemana: user.limparPrioridadesNoFimDaSemana,
    });
  } catch {
    return res.status(500).json({ erro: "Não foi possível carregar a preferência" });
  }
}

/**
 * Atualiza a configuração de limpeza automática de prioridades no fim da semana.
 */
export async function updatePrioritySettings(req: Request, res: Response) {
  const body = parseBody(prioritySettingsSchema, req.body, res);
  if (!body) return;

  try {
    const result = await prisma.user.updateMany({
      where: { id: req.userId! },
      data: {
        limparPrioridadesNoFimDaSemana: body.limparNoFimDaSemana,
      },
    });
    if (result.count === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }
    return res.status(200).json(body);
  } catch {
    return res.status(500).json({ erro: "Não foi possível salvar a preferência" });
  }
}

/**
 * Lista todas as prioridades ativas do usuário autenticado.
 */
export async function getPriorities(req: Request, res: Response) {
  try {
    const priorities = await prisma.priority.findMany({
      where: { userId: req.userId! },
      orderBy: { dataCriacao: "asc" },
    });
    return res.status(200).json(priorities);
  } catch {
    return res.status(500).json({ erro: "Não foi possível carregar as prioridades" });
  }
}

/**
 * Cria uma nova prioridade semanal para o usuário autenticado.
 */
export async function createPriority(req: Request, res: Response) {
  const body = parseBody(prioritySchema, req.body, res);
  if (!body) return;

  try {
    const priority = await prisma.priority.create({
      data: { descricao: body.descricao, concluido: false, userId: req.userId! },
    });
    return res.status(201).json(priority);
  } catch {
    return res.status(500).json({ erro: "Não foi possível criar a prioridade" });
  }
}

/**
 * Alterna o estado de conclusão (feito/a fazer) de uma prioridade específica.
 */
export async function togglePriority(req: Request, res: Response) {
  const id = parseId(req.params.id, res);
  if (!id) return;

  try {
    const priority = await prisma.priority.findFirst({
      where: { id, userId: req.userId! },
    });
    if (!priority) {
      return res.status(404).json({ erro: "Prioridade não encontrada" });
    }

    const updated = await prisma.priority.update({
      where: { id, userId: req.userId! },
      data: { concluido: !priority.concluido },
    });
    return res.status(200).json(updated);
  } catch {
    return res.status(500).json({ erro: "Não foi possível atualizar a prioridade" });
  }
}

/**
 * Remove uma prioridade do usuário.
 */
export async function deletePriority(req: Request, res: Response) {
  const id = parseId(req.params.id, res);
  if (!id) return;

  try {
    const result = await prisma.priority.deleteMany({
      where: { id, userId: req.userId! },
    });
    if (result.count === 0) {
      return res.status(404).json({ erro: "Prioridade não encontrada" });
    }
    return res.status(204).send();
  } catch {
    return res.status(500).json({ erro: "Não foi possível excluir a prioridade" });
  }
}

