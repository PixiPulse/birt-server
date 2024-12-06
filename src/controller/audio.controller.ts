import { Response, Request } from "express-serve-static-core";
import { Prisma } from "@prisma/client";
import { createQueryParams } from "../types/query-params";
import db from "../db/db";
import fs from "fs/promises";
import { audioSchema } from "../schema/audio";

export const getMultiple = async (
  request: Request<{}, {}, {}, createQueryParams>,
  response: Response
) => {
  const page = Number(request.query?.page ?? 1) || 1;
  const limit = Number(request.query?.limit ?? 20) || 20;

  const [audios, audioCount] = await Promise.all([
    db.audio.findMany({
      where: {
        OR: [
          {
            language: {
              name: {
                startsWith: request.query.search,
                mode: "insensitive",
              },
            },
          },
          {
            place: {
              name: {
                startsWith: request.query.search,
                mode: "insensitive",
              },
            },
          },
        ],
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        place: true,
        language: true,
      },
    }),
    db.audio.count({
      where: {
        OR: [
          {
            language: {
              name: {
                startsWith: request.query.search,
                mode: "insensitive",
              },
            },
          },
          {
            place: {
              name: {
                startsWith: request.query.search,
                mode: "insensitive",
              },
            },
          },
        ],
      },
    }),
  ]);

  const res = {
    count: audioCount,
    data: audios,
  };

  response.status(200).json(res);
};

export const getSingle = async (
  request: Request<{ id: string }>,
  response: Response
) => {
  const id = request.params.id;

  const audio = await db.audio.findUnique({
    where: { id },
  });

  if (!audio) return response.status(404).json({ error: "No user found!" });

  return response.status(200).json(audio);
};

export const createNew = async (request: Request, response: Response) => {
  const files = request.files as { [fieldname: string]: Express.Multer.File[] };
  const imgPaths = files["imgPath"];
  const filePath = files["filePath"];

  console.log(imgPaths);
  console.log(filePath);

  if (!imgPaths) return response.status(400).json({ imgPath: "Enter images" });
  if (!filePath)
    return response.status(400).json({ filePath: "Enter audio file" });

  const result = audioSchema.safeParse(request.body);

  if (result.success == false)
    return response
      .status(400)
      .json({ errors: result.error.formErrors.fieldErrors });

  const data = result.data;

  const authUser = request.user;

  const imgUrls: string[] = [];
  const imgUploadPaths: string[] = [];

  for (let i = 0; i < imgPaths.length; i++) {
    imgUrls.push(
      (process.env.ADMIN_DOMAIN as string) +
        imgPaths[i].destination.replace("./assets", "") +
        imgPaths[i].filename
    );
    imgUploadPaths.push(imgPaths[i].destination + imgPaths[i].filename);
  }
  try {
    const audio = await db.audio.create({
      data: {
        placeId: data.placeId,
        languageId: data.languageId,
        imgPath: imgUploadPaths,
        imgUrl: imgUrls,
        filePath: filePath[0].destination + filePath[0].filename,
        fileUrl:
          (process.env.ADMIN_DOMAIN as string) +
          filePath[0].destination.replace("./assets", "") +
          filePath[0].filename,
        adminId: authUser?.id,
      },
    });
    response.status(201).json({ data: audio });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (e.code === "P2002") {
        return response.status(409).json({
          error: `There is a unique constraint violation, a new audio cannot be created with this ${e.meta?.target}`,
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

  const audio = await db.audio.findUnique({
    where: { id },
  });

  if (!audio) return response.status(404).json({ error: "No data" });

  try {
    await fs.unlink(audio.filePath);
    for (let i = 0; i < audio.imgPath.length; i++) {
      await fs.unlink(audio.imgPath[i]);
    }

    await db.audio.delete({
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
