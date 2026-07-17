import { Router } from "express";
import {
  createPriority,
  deletePriority,
  getPriorities,
  togglePriority,
} from "../controllers/priority.controller.js";
import authMiddleware from "./auth.middleware.js";

const router = Router();
router.use(authMiddleware);
router.get("/", getPriorities);
router.post("/", createPriority);
router.patch("/:id/toggle", togglePriority);
router.delete("/:id", deletePriority);

export default router;
