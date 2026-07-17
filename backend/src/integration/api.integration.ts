import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import assert from "node:assert/strict";
import test from "node:test";
import { app } from "../server.js";
import { prisma } from "../prisma.js";

test("authenticated user can manage habits, priorities and notes", async () => {
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const port = (server.address() as AddressInfo).port;
  const baseUrl = `http://127.0.0.1:${port}/api`;
  const email = `codex-${randomUUID()}@example.com`;
  let token = "";

  const request = async (path: string, options: RequestInit = {}) => {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
    const body = response.status === 204 ? undefined : await response.json();
    return { status: response.status, body };
  };

  try {
    const register = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ nome: "Usuário de teste", email, senha: "senha123" }),
    });
    assert.equal(register.status, 201, JSON.stringify(register.body));

    const login = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha: "senha123" }),
    });
    assert.equal(login.status, 200, JSON.stringify(login.body));
    token = (login.body as { token: string }).token;

    const createdHabit = await request("/habits", {
      method: "POST",
      body: JSON.stringify({ nome: "Caminhar" }),
    });
    assert.equal(createdHabit.status, 201, JSON.stringify(createdHabit.body));
    const habitId = (createdHabit.body as { id: number }).id;
    const today = new Date().toISOString().slice(0, 10);
    assert.equal((await request("/habits/toggle", {
      method: "PATCH",
      body: JSON.stringify({ habitId, data: today, concluido: true }),
    })).status, 200);
    const habits = await request("/habits");
    const habit = (habits.body as Array<{ id: number; sequenciaAtual: number; conclusoesNoMes: number }>).find((item) => item.id === habitId);
    assert.ok(habit);
    assert.ok(habit.sequenciaAtual >= 1);
    assert.ok(habit.conclusoesNoMes >= 1);

    const createdPriority = await request("/priorities", {
      method: "POST",
      body: JSON.stringify({ descricao: "Finalizar a semana" }),
    });
    assert.equal(createdPriority.status, 201, JSON.stringify(createdPriority.body));
    const priorityId = (createdPriority.body as { id: number }).id;
    const toggledPriority = await request(`/priorities/${priorityId}/toggle`, { method: "PATCH" });
    assert.equal((toggledPriority.body as { concluido: boolean }).concluido, true);

    const createdNote = await request("/notes", { method: "POST", body: "{}" });
    assert.equal(createdNote.status, 201, JSON.stringify(createdNote.body));
    const noteId = (createdNote.body as { id: number }).id;
    const updatedNote = await request(`/notes/${noteId}`, {
      method: "PUT",
      body: JSON.stringify({ conteudo: "Salva automaticamente", dataExpiracao: null }),
    });
    assert.equal((updatedNote.body as { conteudo: string }).conteudo, "Salva automaticamente");

    assert.equal((await request(`/habits/${habitId}`, { method: "DELETE" })).status, 204);
    assert.equal((await request(`/priorities/${priorityId}`, { method: "DELETE" })).status, 204);
    assert.equal((await request(`/notes/${noteId}`, { method: "DELETE" })).status, 204);
  } finally {
    await prisma.user.deleteMany({ where: { email } });
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await prisma.$disconnect();
  }
});
