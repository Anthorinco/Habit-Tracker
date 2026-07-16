import express from "express";
import authRoutes from "./routes/auth.routes.js";
import routes from "./routes/habit.routes.js";

// Ponto de entrada da API: monta middlewares, rotas e sobe o servidor.
const app = express();

// JSON middleware para ler os payloads de register e login.
app.use(express.json());
// Agrupa as rotas de autenticação sob /api/auth.
app.use("/api/auth", authRoutes);
// Agrupa as rotas de habits sob /api/habit.
app.use("/api/habits", routes);

// Porta local do backend.
const port = 3001;
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
