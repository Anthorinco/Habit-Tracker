import type { Habit, Note, Priority, Session, User } from "./types/Modelo";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";
const SESSION_KEY = "habit-space-session";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function tokenExpired(token: string) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return true;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = JSON.parse(atob(padded)) as { exp?: number };
    return !decoded.exp || decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function loadSession(): Session | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    const session = JSON.parse(stored) as Session;
    if (!session.token || tokenExpired(session.token)) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveSession(session: Session | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (response.status === 204) return undefined as T;
  const body = (await response.json().catch(() => ({}))) as {
    erro?: string;
    mensagem?: string;
  };
  if (!response.ok) {
    throw new ApiError(
      body.erro ?? body.mensagem ?? "Não foi possível concluir a operação",
      response.status,
    );
  }
  return body as T;
}

export const api = {
  register: (data: { nome: string; email: string; senha: string }) =>
    request<{ usuario: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; senha: string }) =>
    request<Session>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  habits: {
    list: (token: string) => request<Habit[]>("/habits", {}, token),
    create: (token: string, nome: string) =>
      request<Habit>(
        "/habits",
        { method: "POST", body: JSON.stringify({ nome }) },
        token,
      ),
    toggle: (token: string, habitId: number, data: string, concluido: boolean) =>
      request<void>(
        "/habits/toggle",
        { method: "PATCH", body: JSON.stringify({ habitId, data, concluido }) },
        token,
      ),
    remove: (token: string, id: number) =>
      request<void>(`/habits/${id}`, { method: "DELETE" }, token),
  },
  priorities: {
    list: (token: string) => request<Priority[]>("/priorities", {}, token),
    create: (token: string, descricao: string) =>
      request<Priority>(
        "/priorities",
        { method: "POST", body: JSON.stringify({ descricao }) },
        token,
      ),
    toggle: (token: string, id: number) =>
      request<Priority>(`/priorities/${id}/toggle`, { method: "PATCH" }, token),
    remove: (token: string, id: number) =>
      request<void>(`/priorities/${id}`, { method: "DELETE" }, token),
  },
  notes: {
    list: (token: string) => request<Note[]>("/notes", {}, token),
    create: (token: string) =>
      request<Note>(
        "/notes",
        { method: "POST", body: JSON.stringify({}) },
        token,
      ),
    update: (
      token: string,
      id: number,
      conteudo: string,
      dataExpiracao: string | null,
    ) =>
      request<Note>(
        `/notes/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({ conteudo, dataExpiracao }),
        },
        token,
      ),
    remove: (token: string, id: number) =>
      request<void>(`/notes/${id}`, { method: "DELETE" }, token),
  },
};
