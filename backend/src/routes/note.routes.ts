import { Router } from "express";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from "../controllers/note.controller.js";
import authMiddleware from "./auth.middleware.js";

const router = Router();
router.use(authMiddleware);
router.get("/", getNotes);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;
