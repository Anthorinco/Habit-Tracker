import { Router } from "express";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from "../controllers/note.controller.js";
import authMiddleware from "./auth.middleware.js";

const router = Router();

// Aplica o middleware de autenticação JWT em todas as rotas de notas rápidas
router.use(authMiddleware);

// Lista as notas rápidas ativas do usuário
router.get("/", getNotes);

// Cria uma nova nota rápida vazia/rascunho
router.post("/", createNote);

// Atualiza o conteúdo ou data de expiração de uma nota
router.put("/:id", updateNote);

// Remove uma nota rápida pelo id
router.delete("/:id", deleteNote);

export default router;

