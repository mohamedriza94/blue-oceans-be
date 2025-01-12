import { z } from "zod";
import { IAdminLogin } from "../interfaces/login";

export const ZOD_loginSchema: z.ZodType<IAdminLogin> = z.object({
  email: z
    .string()
    .nonempty({ message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z.string().nonempty({ message: "Password is required" }),
  rememberMe: z.boolean().optional(),
});
