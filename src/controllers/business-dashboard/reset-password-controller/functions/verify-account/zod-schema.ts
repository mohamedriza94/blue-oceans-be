import { z } from "zod";

export const ZOD_verifyAccountSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});
