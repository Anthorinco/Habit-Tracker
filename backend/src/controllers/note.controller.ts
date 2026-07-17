import type { Request, Response } from "express";
import { prisma } from "../prisma.js";
import { parseBody, parseId } from "../lib/http-validation.js";
import { noteCreateSchema, noteUpdateSchema } from "../lib/schemas.js";

export async function getNotes(req: Request, res: Response) {
  try {
    await prisma.note.deleteMany({
      where: { userId: req.userId!, dataExpiracao: { lte: new Date() } },
    });
    const notes = await prisma.note.findMany({
      where: { userId: req.userId! },
      orderBy: { dataCriacao: "desc" },
    });
    return res.status(200).json(notes);
  } catch {
    return res.status(500).json({ erro: "Não foi possível carregar as notas" });
  }
}

export async function createNote(req: Request, res: Response) {
  const body = parseBody(noteCreateSchema, req.body, res);
  if (!body) return;

  try {
    const note = await prisma.note.create({
      data: {
        conteudo: body.conteudo,
        userId: req.userId!,
        ...(body.dataExpiracao !== undefined && {
          dataExpiracao: body.dataExpiracao ? new Date(body.dataExpiracao) : null,
        }),
      },
    });
    return res.status(201).json(note);
  } catch {
    return res.status(500).json({ erro: "Não foi possível criar a nota" });
  }
}

export async function updateNote(req: Request, res: Response) {
  const id = parseId(req.params.id, res);
  const body = parseBody(noteUpdateSchema, req.body, res);
  if (!id || !body) return;

  try {
    const note = await prisma.note.findFirst({
      where: { id, userId: req.userId! },
      select: { id: true },
    });
    if (!note) {
      return res.status(404).json({ erro: "Nota não encontrada" });
    }

    const updated = await prisma.note.update({
      where: { id, userId: req.userId! },
      data: {
        conteudo: body.conteudo,
        ...(body.dataExpiracao !== undefined && {
          dataExpiracao: body.dataExpiracao ? new Date(body.dataExpiracao) : null,
        }),
      },
    });
    return res.status(200).json(updated);
  } catch {
    return res.status(500).json({ erro: "Não foi possível salvar a nota" });
  }
}

export async function deleteNote(req: Request, res: Response) {
  const id = parseId(req.params.id, res);
  if (!id) return;

  try {
    const result = await prisma.note.deleteMany({
      where: { id, userId: req.userId! },
    });
    if (result.count === 0) {
      return res.status(404).json({ erro: "Nota não encontrada" });
    }
    return res.status(204).send();
  } catch {
    return res.status(500).json({ erro: "Não foi possível excluir a nota" });
  }
}
