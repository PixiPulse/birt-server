import z from "zod";

export const audioSchema = z.object({
  placeId: z.string().min(1),
  languageId: z.string().min(1),
});
