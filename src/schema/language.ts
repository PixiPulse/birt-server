import z from "zod";

export const languageSchema = z.object({
  name: z.string().min(3),
  imgPath: z.string().optional(),
  imgUrl: z.string().optional(),
});
