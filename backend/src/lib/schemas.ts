import { z } from "zod";

// Validador de e-mail comum que normaliza o texto em caixa baixa
const email = z
  .string()
  .trim()
  .email("Informe um e-mail válido")
  .transform((value) => value.toLowerCase());

// Esquema de validação para registro de novos usuários
export const registerSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(80),
  email,
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(72),
});

// Esquema de validação para o login de usuários existentes
export const loginSchema = z.object({
  email,
  senha: z.string().min(1, "Informe sua senha").max(72),
});

// Esquema de validação para a criação de um hábito
export const habitSchema = z.object({
  nome: z.string().trim().min(1, "Informe o hábito").max(120),
});

// Esquema de validação para a criação de uma prioridade
export const prioritySchema = z.object({
  descricao: z.string().trim().min(1, "Informe a prioridade").max(200),
});

// Esquema de validação para alteração das configurações de prioridades
export const prioritySettingsSchema = z.object({
  limparNoFimDaSemana: z.boolean(),
});

// Validador para datas ISO (com offset de timezone)
const expirationDate = z
  .string()
  .datetime({ offset: true, message: "Informe uma data de expiração válida" });

// Esquema de validação para a criação de notas rápidas
export const noteCreateSchema = z.object({
  conteudo: z.string().max(10_000).default(""),
  dataExpiracao: expirationDate.nullable().optional(),
});

// Esquema de validação para a atualização de notas rápidas
export const noteUpdateSchema = z.object({
  conteudo: z.string().max(10_000),
  dataExpiracao: expirationDate.nullable().optional(),
});

// Validador específico para strings de data simples sem hora (no formato YYYY-MM-DD)
const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use uma data no formato AAAA-MM-DD")
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, "Informe uma data válida");

// Esquema de validação para marcar/desmarcar a conclusão de um hábito
export const habitToggleSchema = z.object({
  id_habito: z.number().int().positive(),
  data: dateOnly,
});

