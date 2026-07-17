import assert from "node:assert/strict";
import test from "node:test";
import {
  habitToggleSchema,
  noteUpdateSchema,
  prioritySettingsSchema,
  registerSchema,
} from "./schemas.js";

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
    habitToggleSchema.safeParse({ id_habito: 2, data: "17/07/2026" })
      .success,
    false,
  );
  assert.deepEqual(
    habitToggleSchema.parse({
      id_habito: 2,
      data: "2026-07-17",
    }),
    { id_habito: 2, data: "2026-07-17" },
  );
  assert.equal(
    noteUpdateSchema.safeParse({ conteudo: "texto", dataExpiracao: "amanhã" })
      .success,
    false,
  );
  assert.equal(
    prioritySettingsSchema.safeParse({ limparNoFimDaSemana: "sim" }).success,
    false,
  );
});
