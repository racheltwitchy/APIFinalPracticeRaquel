import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { config } from "../config/environment";

export const authenticateToken = (roles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    jwt.verify(token, config.jwtSecret, (err, user: any) => {
      if (err) {
        res.status(403).json({ message: "Invalid token" });
        return;
      }

      // Verificar roles
      if (roles.length > 0 && !roles.includes(user.role)) {
        res.status(403).json({ message: "Access forbidden: insufficient role" });
        return;
      }

      (req as any).user = user; // Agregar usuario al objeto req
      next(); // Continuar al siguiente middleware o controlador
    });
  };
};
