import type { Response } from "express";
import type { ZodType } from "zod";

export function parseBody<T>(schema: ZodType<T>, input: unknown, res: Response) {
  const result = schema.safeParse(input);
  if (result.success) return result.data;

  res.status(400).json({
    erro: result.error.issues[0]?.message ?? "Dados inválidos",
  });
  return undefined;
}

export function parseId(value: string | string[] | undefined, res: Response) {
  if (Array.isArray(value)) {
    res.status(400).json({ erro: "Id inválido" });
    return undefined;
  }
  const id = Number(value);
  if (Number.isInteger(id) && id > 0) return id;

  res.status(400).json({ erro: "Id inválido" });
  return undefined;
}
