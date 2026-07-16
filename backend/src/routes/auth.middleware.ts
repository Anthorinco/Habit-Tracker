import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Protege rotas lendo o Bearer token do header Authorization.
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ mensagem: "Token não encontrado" });
    }

    // Exige o formato "Bearer <token>".
    const partes = authHeader.split(" ");
    if (partes.length !== 2) {
      return res.status(401).json({ mensagem: "Token mal formatado" });
    }

    const [esquema, token] = partes;
    if (!token || !/^Bearer$/i.test(esquema ?? "")) {
      return res.status(401).json({ mensagem: "Token deve ser do tipo Bearer" });
    }

    // Sem secret valido o ambiente de auth esta quebrado.
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ mensagem: "Configuração de autenticação inválida" });
    }

    // Decodifica o token e confirma que o payload tem um id numerico.
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === "string" || typeof decoded.id !== "number") {
      return res.status(401).json({ mensagem: "Token inválido" });
    }

    // Anexa o usuario identificado para os handlers seguintes.
    req.userId = decoded.id;

    next();
  } catch (error) {
    res.status(401).json({ mensagem: "Token inválido" });
  }
};

export default authMiddleware;
