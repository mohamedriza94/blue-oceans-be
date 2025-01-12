import { z } from "zod";

export const ZOD_requestOTPSchema = z
  .object({
    userID: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
    phoneNumber: z.string().optional(),
  })
  .refine((data) => data.userID || data.email || data.phoneNumber, {
    message: "Either user ID, email, or phone number must be provided",
    path: ["userID", "email", "phoneNumber"],
  });
