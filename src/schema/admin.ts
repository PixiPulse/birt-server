import z from "zod";

export const adminSchema = z.object({
  name: z.string(),
  username: z.string().min(5),
  password: z.string().min(6),
  roles: z.array(z.enum(["superadmin", "admin"])).optional(),
});


export const updateAdminSchema = adminSchema.extend({
    name: z.string().min(3).optional(),
    username: z.string().min(5).optional(),
    password: z.string().min(6).optional(),
  });
