import { NextFunction, Request, Response } from "express-serve-static-core";

export const verifyRoles = (...allowedRoles: string[]) => {
  return (request: Request, response: Response, next: NextFunction) => {
    const authUser = request.user;
    console.log(authUser)
    if (!authUser) return response.sendStatus(401);
    if (!authUser.roles) return response.sendStatus(401);

    const rolesArray = [...allowedRoles]

    const result = authUser.roles
      .map((role) => rolesArray.includes(role))
      .find((value) => value === true);

    if (!result) return response.sendStatus(401);
    next();
  };
};
