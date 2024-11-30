import { Response, Request } from "express-serve-static-core";
import { Prisma } from "@prisma/client";
import { createQueryParams } from "../types/query-params";
import db from "../db/db";
import { languageSchema } from "../schema/language";
import fs from "fs/promises";
import { audioSchema } from "../schema/audio";

export const getMultiple = async (
  request: Request<{}, {}, {}, createQueryParams>,
  response: Response,
) => {
  const page = Number(request.query?.page ?? 1) || 1;
  const limit = Number(request.query?.limit ?? 20) || 20;

  const [audios, audioCount] = await Promise.all([
    db.audio.findMany({
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.audio.count(),
  ]);

  const res = {
    count: audioCount,
    data: audios,
  };

  response.status(200).json(res);
};

export const getSingle = async (
  request: Request<{ id: string }>,
  response: Response,
) => {
  const id = request.params.id;

  const audio = await db.audio.findUnique({
    where: { id },
  });

  if (!audio) return response.status(404).json({ error: "No user found!" });

  return response.status(200).json(audio);
};

export const createNew = async (request: Request, response: Response) => {
  response.send("ok")
};

export const deleteOne = async (
  request: Request<{ id: string }>,
  response: Response,
) => {
  const id = request.params.id;

  const place = await db.place.findUnique({
    where: { id },
  });

  if (!place) return response.status(404).json({ error: "No data" });

  try {
    await fs.unlink("./assets" + place.imgPath);

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
