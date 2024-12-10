import { Response, Request } from "express-serve-static-core";
import * as jwt from "jsonwebtoken";
import { authSchema } from "../schema/auth";
import db from "../db/db";
import { ROLE_LIST } from "../lib/data";
import { hashPassword, isValidPassword } from "../lib/helper";

export const getUserToken = async (request: Request, response: Response) => {
  const result = authSchema.safeParse(request.body);

  if (result.success == false) {
    return response.status(400).json({errors: result.error?.formErrors.fieldErrors});
  }

  const data = result.data;

  try {
    const user = await db.user.findUnique({
      where: {
        username: data.username,
      },
    });

    if (!user) return response.status(404).json({ error: "No user found" });

    if (!await isValidPassword(data.password, user.password))
      return response.status(401).json({ error: "Invalid password" });

    const authUser = {
      id: user.id,
      username: user.username,
      roles: [ROLE_LIST.user],
    };

    const accessToken = jwt.sign(
      authUser,
      process.env.ACCESS_SECRETE_KEY as string,
    );

    response.status(200).json({
      accessToken: accessToken,
    });
  } catch (e) {
    console.log(e);
  }
};

export const getAdminToken = async (request: Request, response: Response) => {
  const result = authSchema.safeParse(request.body);

  if (result.success == false) {
    return response.status(400).json({errors: result.error?.formErrors.fieldErrors});
  }

  const data = result.data;
  console.log(await hashPassword(data.password));

  try {
    const user = await db.admin.findUnique({
      where: {
        username: data.username,
      },
    });

    if (!user) return response.status(404).json({ error: "No user found" });

    if (!await isValidPassword(data.password, user.password))
      return response.status(401).json({ error: "Invalid password" });

    const authUser = {
      id: user.id,
      username: user.username,
      roles: user.roles,
    };

    const accessToken = jwt.sign(
      authUser,
      process.env.ACCESS_SECRETE_KEY as string,
    );

    response.status(200).json({
      accessToken: accessToken,
    });
  } catch (e) {
    console.log(e);
  }
};
