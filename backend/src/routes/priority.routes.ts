import { Router } from "express";
import {
  createPriority,
  deletePriority,
  getPrioritySettings,
  getPriorities,
  togglePriority,
  updatePrioritySettings,
} from "../controllers/priority.controller.js";
import authMiddleware from "./auth.middleware.js";

const router = Router();

// Protege todas as rotas de prioridade com o middleware de autenticação JWT
router.use(authMiddleware);

// Recupera as configurações de prioridades do usuário (como a de limpeza automática)
router.get("/settings", getPrioritySettings);

// Atualiza as configurações de prioridades do usuário
router.patch("/settings", updatePrioritySettings);

// Lista todas as prioridades da semana do usuário
router.get("/", getPriorities);

// Cria uma nova prioridade da semana
router.post("/", createPriority);

// Alterna o estado de conclusão de uma prioridade (feito / não feito)
router.patch("/:id/toggle", togglePriority);

// Remove uma prioridade pelo ID
router.delete("/:id", deletePriority);

export default router;

