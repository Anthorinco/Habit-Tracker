import assert from "node:assert/strict";
import test from "node:test";
import { habitToggleSchema, noteUpdateSchema, registerSchema } from "./schemas.js";

test("register validation rejects unsafe input and normalizes valid data", () => {
  assert.equal(
    registerSchema.safeParse({ nome: "", email: "invalido", senha: "123" })
      .success,
    false,
  );

  const result = registerSchema.parse({
    nome: "  Ana Silva  ",
    email: "  ANA@EXEMPLO.COM ",
    senha: "segredo123",
  });

  assert.deepEqual(result, {
    nome: "Ana Silva",
    email: "ana@exemplo.com",
    senha: "segredo123",
  });
});

test("habit toggle and note autosave accept only structured data", () => {
  assert.equal(
    habitToggleSchema.safeParse({ habitId: 2, data: "17/07/2026", concluido: true })
      .success,
    false,
  );
  assert.deepEqual(
    habitToggleSchema.parse({
      habitId: 2,
      data: "2026-07-17",
      concluido: true,
    }),
    { habitId: 2, data: "2026-07-17", concluido: true },
  );
  assert.equal(
    noteUpdateSchema.safeParse({ conteudo: "texto", dataExpiracao: "amanhã" })
      .success,
    false,
  );
});
