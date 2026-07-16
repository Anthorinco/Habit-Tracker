import * as express from "express";

// Extensao global para carregar o id do usuario autenticado na request.
declare global {
  namespace Express {
    interface Request {
      userId?: number;
  }
}
}
