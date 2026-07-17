import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import assert from "node:assert/strict";
import test from "node:test";
import { currentCalendarDate } from "../lib/calendar.js";
import { app } from "../server.js";
import { prisma } from "../prisma.js";

test("authenticated user can manage habits, priorities and notes", async () => {
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const port = (server.address() as AddressInfo).port;
  const origin = `http://127.0.0.1:${port}`;
  const baseUrl = `${origin}/api`;
  const email = `codex-${randomUUID()}@example.com`;
  const otherEmail = `codex-${randomUUID()}@example.com`;
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
    const frontend = await fetch(origin);
    assert.equal(frontend.status, 200);
    assert.match(await frontend.text(), /<div id="root"><\/div>/);
    assert.equal((await request("/habits")).status, 401);

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

    const initialSettings = await request("/priorities/settings");
    assert.equal(initialSettings.status, 200, JSON.stringify(initialSettings.body));
    assert.equal(
      (initialSettings.body as { limparNoFimDaSemana: boolean })
        .limparNoFimDaSemana,
      true,
    );
    const changedSettings = await request("/priorities/settings", {
      method: "PATCH",
      body: JSON.stringify({ limparNoFimDaSemana: false }),
    });
    assert.equal(changedSettings.status, 200, JSON.stringify(changedSettings.body));
    assert.equal(
      (changedSettings.body as { limparNoFimDaSemana: boolean })
        .limparNoFimDaSemana,
      false,
    );

    const createdHabit = await request("/habits", {
      method: "POST",
      body: JSON.stringify({ nome: "Caminhar" }),
    });
    assert.equal(createdHabit.status, 201, JSON.stringify(createdHabit.body));
    const habitId = (createdHabit.body as { id: number }).id;
    const today = currentCalendarDate();
    const checkedHabit = await request("/habits/toggle", {
      method: "PATCH",
      body: JSON.stringify({ id_habito: habitId, data: today }),
    });
    assert.equal(checkedHabit.status, 200, JSON.stringify(checkedHabit.body));
    assert.equal((checkedHabit.body as { concluido: boolean }).concluido, true);
    const habits = await request("/habits");
    const habit = (habits.body as Array<{ id: number; sequenciaAtual: number; conclusoesNoMes: number; historicoSemanal: Array<{ data: string; concluido: boolean }> }>).find((item) => item.id === habitId);
    assert.ok(habit);
    assert.ok(habit.sequenciaAtual >= 1);
    assert.ok(habit.conclusoesNoMes >= 1);
    assert.equal(
      habit.historicoSemanal.find((day) => day.data === today)?.concluido,
      true,
    );

    const uncheckedHabit = await request("/habits/toggle", {
      method: "PATCH",
      body: JSON.stringify({ id_habito: habitId, data: today }),
    });
    assert.equal(uncheckedHabit.status, 200, JSON.stringify(uncheckedHabit.body));
    assert.equal((uncheckedHabit.body as { concluido: boolean }).concluido, false);
    const habitsAfterUncheck = await request("/habits");
    const habitAfterUncheck = (habitsAfterUncheck.body as Array<{ id: number; historicoSemanal: Array<{ data: string; concluido: boolean }> }>).find((item) => item.id === habitId);
    assert.equal(
      habitAfterUncheck?.historicoSemanal.find((day) => day.data === today)
        ?.concluido,
      false,
    );

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

    const expiredNote = await request("/notes", {
      method: "POST",
      body: JSON.stringify({
        conteudo: "Nota vencida",
        dataExpiracao: "2020-01-01T00:00:00.000Z",
      }),
    });
    assert.equal(expiredNote.status, 201, JSON.stringify(expiredNote.body));
    const expiredNoteId = (expiredNote.body as { id: number }).id;
    const notesAfterExpiration = await request("/notes");
    assert.equal(
      (notesAfterExpiration.body as Array<{ id: number }>).some(
        (note) => note.id === expiredNoteId,
      ),
      false,
    );

    const ownerToken = token;
    assert.equal((await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ nome: "Outro usuário", email: otherEmail, senha: "senha123" }),
    })).status, 201);
    const otherLogin = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: otherEmail, senha: "senha123" }),
    });
    assert.equal(otherLogin.status, 200, JSON.stringify(otherLogin.body));
    token = (otherLogin.body as { token: string }).token;

    assert.equal((await request("/habits/toggle", {
      method: "PATCH",
      body: JSON.stringify({ id_habito: habitId, data: today }),
    })).status, 404);
    assert.equal((await request(`/habits/${habitId}`, { method: "DELETE" })).status, 404);
    assert.equal((await request(`/priorities/${priorityId}/toggle`, { method: "PATCH" })).status, 404);
    assert.equal((await request(`/priorities/${priorityId}`, { method: "DELETE" })).status, 404);
    assert.equal((await request(`/notes/${noteId}`, {
      method: "PUT",
      body: JSON.stringify({ conteudo: "Tentativa indevida" }),
    })).status, 404);
    assert.equal((await request(`/notes/${noteId}`, { method: "DELETE" })).status, 404);
    token = ownerToken;

    assert.equal((await request(`/habits/${habitId}`, { method: "DELETE" })).status, 204);
    assert.equal((await request(`/priorities/${priorityId}`, { method: "DELETE" })).status, 204);
    assert.equal((await request(`/notes/${noteId}`, { method: "DELETE" })).status, 204);
  } finally {
    await prisma.user.deleteMany({ where: { email: { in: [email, otherEmail] } } });
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await prisma.$disconnect();
  }
});
