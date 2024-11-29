import { Response, Request } from "express-serve-static-core";
import { Prisma } from "@prisma/client";
import { createQueryParams } from "../types/query-params";
import db from "../db/db";
import { updateAdminSchema } from "../schema/admin";
import { languageSchema } from "../schema/language";
import fs from "fs/promises";
import { UploadedFile } from "express-fileupload";

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
  const authUser = request.user;

  if (!request.files || Object.keys(request.files).length === 0) {
    return response.status(400).json({ imgPath: "No files were uploaded." });
  }

  const result = languageSchema.safeParse(request.body);
  if (result.success === false) {
    return response.status(400).json(result.error.formErrors.fieldErrors);
  }

  const data = result.data;

  const imgFile = request.files.imgPath as UploadedFile;
  const imgPath = "/language/" + crypto.randomUUID() + imgFile.name;
  const uploadPath = "./assets" + imgPath;

  // Use the mv() method to place the file somewhere on your server
  imgFile.mv(uploadPath, function (err) {
    if (err) return response.status(500).send(err);
  });

  try {
    const language = await db.language.create({
      data: {
        name: data.name,
        imgPath: imgPath,
        adminId: authUser?.id,
      },
    });
    return response.status(201).json(language);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (e.code === "P2002") {
        return response.status(409).json({
          error: `There is a unique constraint violation, a new language file cannot be created with this ${e.meta?.target}`,
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
