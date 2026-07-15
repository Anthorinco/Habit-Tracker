import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";



const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ mensagem: "Token não encontrado" });
    }

    const partes = authHeader.split(" ");
    if (partes.length !== 2) {
      return res.status(401).json({ mensagem: "Token mal formatado" });
    }

    const [esquema, token] = partes;
    if (!token || !/^Bearer$/i.test(esquema ?? "")) {
      return res.status(401).json({ mensagem: "Token deve ser do tipo Bearer" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ mensagem: "Configuração de autenticação inválida" });
    }

    const decoded = jwt.verify(token, secret);
    if (typeof decoded === "string" || typeof decoded.id !== "number") {
      return res.status(401).json({ mensagem: "Token inválido" });
    }

    req.userId = decoded.id;

    next();
  } catch (error) {
    res.status(401).json({ mensagem: "Token inválido" });
  }
};

export default authMiddleware;
