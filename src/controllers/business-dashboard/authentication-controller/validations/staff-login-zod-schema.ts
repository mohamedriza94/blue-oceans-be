import { z } from "zod";
import { IStaffLogin } from "../interfaces/login";

export const ZOD_staffLoginSchema: z.ZodType<IStaffLogin> = z.object({
  email: z
    .string()
    .nonempty({ message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z.string().nonempty({ message: "Password is required" }),
  otp: z
    .string()
    .length(6, { message: "OTP must be exactly 6 digits" })
    .optional(),
  rememberMe: z.boolean().optional(),
});
