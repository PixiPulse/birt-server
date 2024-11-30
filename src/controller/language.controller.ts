import { Response, Request, NextFunction } from "express-serve-static-core";
import { Prisma } from "@prisma/client";
import { createQueryParams } from "../types/query-params";
import db from "../db/db";
import { languageSchema } from "../schema/language";
import fs from "fs/promises";

export const getMultiple = async (
  request: Request<{}, {}, {}, createQueryParams>,
  response: Response,
) => {
  const page = Number(request.query?.page ?? 1) || 1;
  const limit = Number(request.query?.limit ?? 20) || 20;

  const [languages, languageCount] = await Promise.all([
    db.language.findMany({
      where: {
        name: {
          startsWith: request.query.search,
          mode: "insensitive",
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.language.count({
      where: {
        name: {
          contains: request.query.search,
          mode: "insensitive",
        },
      },
    }),
  ]);

  const res = {
    count: languageCount,
    data: languages,
  };

  response.status(200).json(res);
};

export const getSingle = async (
  request: Request<{ id: string }>,
  response: Response,
) => {
  const id = request.params.id;

  const language = await db.language.findUnique({
    where: { id },
  });

  if (!language) return response.status(404).json({ error: "No user found!" });

  return response.status(200).json(language);
};


export const createNew = async (request: Request, response: Response) => {
  if (!request.file)
    return response.status(400).json({ imgPath: "Enter image of language" });

  const imgFile = request.file;

  const result = languageSchema.safeParse(request.body);

  if (result.success == false)
    return response.status(400).json(result.error.formErrors.fieldErrors);

  const data = result.data;

  const authUser = request.user;

  try {
    const language = await db.language.create({
      data: {
        name: data.name,
        imgPath: imgFile.destination + imgFile.filename,
        imgUrl:
          (process.env.ADMIN_DOMAIN as string) +
          imgFile.destination.replace("./assets", "") +
          imgFile.filename,
        adminId: authUser?.id,
      },
    });

    response.status(201).json(language);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (e.code === "P2002") {
        return response.status(409).json({
          error: `There is a unique constraint violation, a new language cannot be created with this ${e.meta?.target}`,
        });
      }
      return response.status(400).json({ error: e.message });
    }
  }
};

export const deleteOne = async (
  request: Request<{ id: string }>,
  response: Response,
) => {
  const id = request.params.id;

  const language = await db.language.findUnique({
    where: { id },
  });

  if (!language) return response.status(404).json({ error: "No data" });

  try {
    await fs.unlink("./assets" + language.imgPath);

    await db.language.delete({
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
