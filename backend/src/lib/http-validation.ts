import type { Response } from "express";
import type { ZodType } from "zod";

/**
 * Valida o corpo de uma requisição Express contra um esquema do Zod.
 * Retorna os dados validados se corretos, ou envia um erro 400 Bad Request se falhar.
 */
export function parseBody<T>(schema: ZodType<T>, input: unknown, res: Response) {
  const result = schema.safeParse(input);
  if (result.success) return result.data;

  res.status(400).json({
    erro: result.error.issues[0]?.message ?? "Dados inválidos",
  });
  return undefined;
}

/**
 * Valida um parâmetro ID enviado na URL da requisição.
 * Garante que é um número inteiro válido maior que zero, enviando 400 Bad Request se inválido.
 */
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

