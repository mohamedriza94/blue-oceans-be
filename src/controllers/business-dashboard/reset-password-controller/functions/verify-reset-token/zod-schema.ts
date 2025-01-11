import { z } from "zod";

export const ZOD_verifyTokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});
