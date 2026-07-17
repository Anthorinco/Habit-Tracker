import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import habitRoutes from "./routes/habit.routes.js";
import noteRoutes from "./routes/note.routes.js";
import priorityRoutes from "./routes/priority.routes.js";
import { scheduleCleanup } from "./services/cleanup.service.js";

export const app = express();

// O Vercel carrega esta aplicação diretamente como uma função.
// Em desenvolvimento local, a função startServer abaixo continua abrindo a porta.
export default app;
const allowedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "32kb" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/priorities", priorityRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api", (_req, res) =>
  res.status(404).json({ erro: "Rota não encontrada" }),
);

const frontendDirectory = fileURLToPath(new URL("../../dist", import.meta.url));
const frontendIndex = fileURLToPath(
  new URL("../../dist/index.html", import.meta.url),
);

if (existsSync(frontendIndex)) {
  app.use(express.static(frontendDirectory));
  app.get(/.*/, (_req, res) => res.sendFile(frontendIndex));
}

app.use((_req, res) => res.status(404).json({ erro: "Rota não encontrada" }));

export function startServer() {
  scheduleCleanup();
  const port = Number(process.env.PORT ?? 3001);
  return app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

const entryFile = process.argv[1];
if (entryFile && import.meta.url === pathToFileURL(entryFile).href) {
  startServer();
}
