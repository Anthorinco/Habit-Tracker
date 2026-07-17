import { z } from "zod";

const email = z
  .string()
  .trim()
  .email("Informe um e-mail válido")
  .transform((value) => value.toLowerCase());

export const registerSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(80),
  email,
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(72),
});

export const loginSchema = z.object({
  email,
  senha: z.string().min(1, "Informe sua senha").max(72),
});

export const habitSchema = z.object({
  nome: z.string().trim().min(1, "Informe o hábito").max(120),
});

export const prioritySchema = z.object({
  descricao: z.string().trim().min(1, "Informe a prioridade").max(200),
});

export const prioritySettingsSchema = z.object({
  limparNoFimDaSemana: z.boolean(),
});

const expirationDate = z
  .string()
  .datetime({ offset: true, message: "Informe uma data de expiração válida" });

export const noteCreateSchema = z.object({
  conteudo: z.string().max(10_000).default(""),
  dataExpiracao: expirationDate.nullable().optional(),
});

export const noteUpdateSchema = z.object({
  conteudo: z.string().max(10_000),
  dataExpiracao: expirationDate.nullable().optional(),
});

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use uma data no formato AAAA-MM-DD")
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, "Informe uma data válida");

export const habitToggleSchema = z.object({
  id_habito: z.number().int().positive(),
  data: dateOnly,
});
