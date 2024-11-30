import z from "zod";

export const userSchema = z.object({
  name: z.string(),
  username: z.string().min(5),
  password: z.string().min(6),
  placeId: z.string().optional(),
});

export const updateUserSchema = userSchema.extend({
  name: z.string().min(3).optional(),
  username: z.string().min(5).optional(),
  password: z.string().min(6).optional(),
});
