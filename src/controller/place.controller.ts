import { Response, Request } from "express-serve-static-core";
import { Prisma } from "@prisma/client";
import { createQueryParams } from "../types/query-params";
import db from "../db/db";
import { languageSchema } from "../schema/language";
import fs from "fs/promises";

export const getMultiple = async (
  request: Request<{}, {}, {}, createQueryParams>,
  response: Response
) => {
  const page = Number(request.query?.page ?? 1) || 1;
  const limit = Number(request.query?.limit ?? 20) || 20;

  const [places, placeCount] = await Promise.all([
    db.place.findMany({
      where: {
        name: {
          startsWith: request.query.search,
          mode: "insensitive",
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.place.count({
      where: {
        name: {
          contains: request.query.search,
          mode: "insensitive",
        },
      },
    }),
  ]);

  const res = {
    count: placeCount,
    data: places,
  };

  response.status(200).json(res);
};

export const getSingle = async (
  request: Request<{ id: string }>,
  response: Response
) => {
  const id = request.params.id;

  const place = await db.place.findUnique({
    where: { id },
  });

  if (!place) return response.status(404).json({ error: "No place found!" });

  return response.status(200).json(place);
};

export const getPlaceAudio = async (request: Request, response: Response) => {
  const id = request.params.id;

  const authUser = request.user;

  if (!authUser) return response.status(401).json({ error: "Unauthorized" });

  const user = await db.user.findUnique({
    where: { id: authUser.id },
  });

  if (user?.placeId !== id)
    return response.status(401).json({ error: "Unauthorized" });

  const place = await db.audio.findMany({
    where: { placeId: id },
    select: {
      id: true,
      fileUrl: true,
      imgUrl: true,
      place: true,
      language: true,
    },
  });

  if (!place) return response.status(404).json({ error: "No place found!" });

  return response.status(200).json(place);
};

export const createNew = async (request: Request, response: Response) => {
  if (!request.file)
    return response.status(400).json({ imgPath: "Enter image of place" });

  const imgFile = request.file;

  const result = languageSchema.safeParse(request.body);

  if (result.success == false)
    return response
      .status(400)
      .json({ errors: result.error.formErrors.fieldErrors });

  const data = result.data;

  const authUser = request.user;

  try {
    const language = await db.place.create({
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

    response.status(201).json({ data: language });
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

export const updateOne = async (
  request: Request<{ id: string }>,
  response: Response
) => {
  const { id } = request.params;

  const prevData = await db.place.findUnique({
    where: { id },
  });

  if (!prevData) return response.status(404).json({ error: "No data found" });

  if (!request.file)
    return response.status(400).json({ imgPath: "Enter image of place" });

  await fs.unlink(prevData.imgPath);

  const imgFile = request.file;

  const result = languageSchema.safeParse(request.body);

  if (result.success == false)
    return response
      .status(400)
      .json({ errors: result.error.formErrors.fieldErrors });

  const data = result.data;

  const authUser = request.user;

  try {
    const language = await db.place.update({
      where: { id },
      data: {
        name: data.name || prevData.name,
        imgPath: imgFile.destination + imgFile.filename,
        imgUrl:
          (process.env.ADMIN_DOMAIN as string) +
          imgFile.destination.replace("./assets", "") +
          imgFile.filename,
        adminId: authUser?.id,
      },
    });

    response.status(200).json({ data: language });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (e.code === "P2002") {
        return response.status(409).json({
          error: `There is a unique constraint violation, a place cannot be created with this ${e.meta?.target}`,
        });
      }
      return response.status(400).json({ error: e.message });
    }
  }
};

export const deleteOne = async (
  request: Request<{ id: string }>,
  response: Response
) => {
  const id = request.params.id;

  const place = await db.place.findUnique({
    where: { id },
  });

  if (!place) return response.status(404).json({ error: "No data" });

  try {
    await fs.unlink(place.imgPath);

    await db.place.delete({
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
