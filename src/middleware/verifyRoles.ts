import { NextFunction, Request, Response } from "express-serve-static-core";

export const verifyRoles = (...allowedRoles: string[]) => {
  return (request: Request, response: Response, next: NextFunction) => {
    const authUser = request.user;

    if (!authUser) return response.status(401).json({ error: "Forbidden" });
    if (!authUser.roles)
      return response.status(401).json({ error: "Forbidden" });

    const rolesArray = [...allowedRoles];

    const result = authUser.roles
      .map((role) => rolesArray.includes(role))
      .find((value) => value === true);

    if (!result) return response.status(401).json({ error: "Forbidden" })
    next();
  };
};
