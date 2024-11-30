import { Response, Request } from "express-serve-static-core";
import { Prisma } from "@prisma/client";
import { createQueryParams } from "../types/query-params";
import db from "../db/db";
import { adminSchema, updateAdminSchema } from "../schema/admin";
import { hashPassword } from "../lib/helper";

export const getMultiple = async (
  request: Request<{}, {}, {}, createQueryParams>,
  response: Response,
) => {
  const page = Number(request.query?.page ?? 1) || 1;
  const limit = Number(request.query?.limit ?? 20) || 20;

  const [adminUsers, adminCount] = await Promise.all([
    db.admin.findMany({
      where: {
        name: {
          startsWith: request.query.search,
          mode: "insensitive",
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.admin.count({
      where: {
        name: {
          contains: request.query.search,
          mode: "insensitive",
        },
      },
    }),
  ]);

  const res = {
    count: adminCount,
    data: adminUsers,
  };

  response.status(200).json(res);
};

export const getSingle = async (
  request: Request<{ id: string }>,
  response: Response,
) => {
  const id = request.params.id;

  const adminUser = await db.admin.findUnique({
    where: { id },
  });

  if (!adminUser) return response.status(404).json({ error: "No user found!" });

  return response.status(200).json(adminUser);
};

export const createNew = async (request: Request, response: Response) => {
  const result = adminSchema.safeParse(request.body);

  if (result.success == false) {
    return response.status(400).json(result.error?.formErrors.fieldErrors);
  }

  const data = result.data;
  data.password = await hashPassword(data.password);

  
  try {
    const adminUser = await db.admin.create({
      data: {
        ...data,
      },
    });

    return response.status(201).json(adminUser);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (e.code === "P2002") {
        return response.status(409).json({
          error: `There is a unique constraint violation, a new user cannot be created with this ${e.meta?.target}`,
        });
      }
      return response.status(400).json({ error: e.message });
    }
  }
};

export const updateOne = async (
  request: Request<{ id: string }>,
  response: Response,
) => {
  const id = request.params.id;

  const result = updateAdminSchema.safeParse(request.body);

  if (result.success == false) {
    return response.status(400).json(result.error?.formErrors.fieldErrors);
  }

  // re-consider admin role adding process

  const data = result.data;

  try {
    const adminUser = await db.admin.update({
      where: { id: id },
      data: {
        ...data,
      },
    });

    response.status(200).json(adminUser);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (e.code === "P2002") {
        response.status(400).json({
          status: `There is a unique constraint violation, a new user cannot be created with this ${e.meta?.target}`,
        });
      } else {
        response.status(400).send(e.message);
      }
    }
  }
};

export const deleteOne = async (
  request: Request<{ id: string }>,
  response: Response,
) => {
  const id = request.params.id;

  try {
    await db.admin.delete({
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
