import type { Request, Response } from "express";
import { prisma } from "../prisma.js";
import { parseBody, parseId } from "../lib/http-validation.js";
import { prioritySchema } from "../lib/schemas.js";

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
      where: { id },
      data: { concluido: !priority.concluido },
    });
    return res.status(200).json(updated);
  } catch {
    return res.status(500).json({ erro: "Não foi possível atualizar a prioridade" });
  }
}

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
