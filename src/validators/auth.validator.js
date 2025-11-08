import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  fullname: z.string().min(3).max(120),
});

export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});
