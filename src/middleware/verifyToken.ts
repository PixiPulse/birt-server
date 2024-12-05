import {
  Response,
  Request,
  NextFunction,
} from "express-serve-static-core";
import * as jwt from "jsonwebtoken";
import { AuthUser } from "../types/auth";

export function verifyToken(
  request: Request,
  response: Response,
  next: NextFunction,
): any {
  const authHeader = request.headers["authorization"];

  if (!authHeader?.startsWith("Bearer ")) return response.status(401).json({error: "Forbidden"});

  const token = authHeader && authHeader?.split(" ")[1]; // token example: Bearer <TOKEN>

  if (token == null) return response.status(401).json({ error: "no token" });

  jwt.verify(token, process.env.ACCESS_SECRETE_KEY as string, (err, user) => {
    if (err) return response.status(403).json({error: "invalid token"});

    request.user = user as AuthUser;
    next();
  });
}
