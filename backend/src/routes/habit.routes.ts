import { Router } from "express";
import authMiddleware from "./auth.middleware.js";
import {
  createHabit,
  deleteHabit,
  getHabits,
  toggleHabit,
} from "../controllers/habit.controller.js";

const router = Router();

// Rotas protegidas de habitos.
// Cria um novo habito.
router.post("/", authMiddleware, createHabit);
// Lista os habitos do usuario logado.
router.get("/", authMiddleware, getHabits);
// Marca ou desmarca um dia do hábito de forma idempotente.
router.patch("/toggle", authMiddleware, toggleHabit);
// Remove um habito pelo id.
router.delete("/:id", authMiddleware, deleteHabit);

export default router;
