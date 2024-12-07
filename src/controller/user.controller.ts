import { Response, Request } from "express-serve-static-core";
import { Prisma } from "@prisma/client";
import { createQueryParams } from "../types/query-params";
import db from "../db/db";
import { updateUserSchema, userSchema } from "../schema/user";
import { hashPassword } from "../lib/helper";

export const getMultiple = async (
  request: Request<{}, {}, {}, createQueryParams>,
  response: Response
) => {
  const page = Number(request.query?.page ?? 1) || 1;
  const limit = Number(request.query?.limit ?? 20) || 20;

  const [users, userCount] = await Promise.all([
    db.user.findMany({
      where: {
        name: {
          startsWith: request.query.search,
          mode: "insensitive",
        },
      },
      include: {
        place: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.user.count({
      where: {
        name: {
          contains: request.query.search,
          mode: "insensitive",
        },
      },
    }),
  ]);

  const res = {
    count: userCount,
    data: users,
  };

  response.status(200).json(res);
};

export const getSingle = async (
  request: Request<{ id: string }>,
  response: Response
) => {
  const id = request.params.id;

  const user = await db.user.findUnique({
    where: { id },
  });

  if (!user) return response.status(404).json({ error: "No user found!" });

  return response.status(200).json(user);
};

export const createNew = async (request: Request, response: Response) => {
  const result = userSchema.safeParse(request.body);

  if (result.success == false) {
    return response
      .status(400)
      .json({ errors: result.error?.formErrors.fieldErrors });
  }

  const data = result.data;
  data.password = await hashPassword(data.password);

  try {
    const user = await db.user.create({
      data: {
        ...data,
        adminId: request.user?.id,
      },
    });

    return response.status(201).json({ data: user });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (e.code === "P2002") {
        return response.status(409).json({
          error: `There is a unique constraint violation, a new user cannot be created with this ${e.meta?.target}`,
        });
      }
      return response.status(400).json({ error: e.message.split("\n").pop() });
    }
  }
};

export const updateOne = async (
  request: Request<{ id: string }>,
  response: Response
) => {
  const id = request.params.id;

  const result = updateUserSchema.safeParse(request.body);

  if (result.success == false) {
    return response
      .status(400)
      .json({ errors: result.error?.formErrors.fieldErrors });
  }

  // re-consider admin role adding process

  const data = result.data;

  try {
    const user = await db.user.update({
      where: { id: id },
      data: {
        ...data,
        adminId: request.user?.id,
      },
    });

    response.status(200).json({ data: user });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (e.code === "P2002") {
        response.status(400).json({
          error: `There is a unique constraint violation, a new user cannot be created with this ${e.meta?.target}`,
        });
      } else {
        return response
          .status(400)
          .json({ error: e.message.split("\n").pop() });
      }
    }
  }
};

export const deleteOne = async (
  request: Request<{ id: string }>,
  response: Response
) => {
  const id = request.params.id;

  try {
    await db.user.delete({
      where: { id },
    });
    return response.sendStatus(204);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return response.status(404).json({ error: e.meta?.cause });
      }
      return response.status(400).json({ error: e.message.split("\n").pop() });
    }
  }
};
