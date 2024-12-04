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

  if (token == null) return response.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_SECRETE_KEY as string, (err, user) => {
    if (err) return response.sendStatus(403);

    request.user = user as AuthUser;
    next();
  });
}
